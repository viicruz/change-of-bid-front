// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as z from "zod"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import {
  storeDepositSchema,
  useStoreDeposit,
  type StoreDeposit,
} from "@/src/hooks/wallets/mutations/use-store-deposit"

//* Local imports
import { ApiError, ApiSchemaError } from "@/src/lib/api"
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"
import type { Wallet } from "@/src/schemas/wallet"

const previousWallet: Wallet = {
  totalBalance: "10.00",
  committedBalance: "4.00",
  availableBalance: "6.00",
}

const depositedWallet: Wallet = {
  totalBalance: "12.50",
  committedBalance: "4.00",
  availableBalance: "8.50",
}

function jsonResponse(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function issueMessages(error: z.ZodError, path: string) {
  return error.issues
    .filter((issue) => issue.path.join(".") === path)
    .map((issue) => issue.message)
}

function DepositHarness(props: { amount: StoreDeposit["amount"] | number }) {
  const storeDeposit = useStoreDeposit()

  return createElement(
    "button",
    {
      id: "store-deposit-submit",
      type: "button",
      onClick: () => {
        void storeDeposit
          .mutateAsync({ amount: props.amount } as StoreDeposit)
          .catch(() => undefined)
      },
    },
    storeDeposit.isSuccess
      ? `deposited:${storeDeposit.data.totalBalance}:${storeDeposit.data.committedBalance}:${storeDeposit.data.availableBalance}`
      : storeDeposit.isError
        ? `error:${
            storeDeposit.error instanceof ApiError
              ? ((storeDeposit.error.body as { code?: string }).code ??
                storeDeposit.error.status)
              : storeDeposit.error instanceof ApiSchemaError
                ? "schema"
                : "unknown"
          }`
        : "idle"
  )
}

describe("storeDepositSchema", () => {
  it("accepts a positive amount with at most two decimal places", () => {
    for (const amount of [
      "0.01",
      "0.1",
      "0.10",
      "2",
      "2.5",
      "2.50",
      "1000000",
      "1000000.00",
    ]) {
      expect(storeDepositSchema.parse({ amount }).amount).toBe(amount)
    }
  })

  it("trims surrounding spaces before validating the amount", () => {
    expect(storeDepositSchema.parse({ amount: "  2.50  " }).amount).toBe("2.50")
  })

  it("rejects an amount that breaks the money rules", () => {
    for (const amount of [
      "",
      " ",
      "0",
      "0.0",
      "0.00",
      "0.001",
      "-1",
      "+2.50",
      "01.50",
      "1,50",
      "1.000",
      "2.",
      "2. 50",
      "10.555",
      "10000000000000000",
      "10000000000000000.01",
    ]) {
      const result = storeDepositSchema.safeParse({ amount })

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "amount")).toEqual(["INVALID_MONEY"])
      }
    }
  })

  it("rejects an amount above BRL 1000000.00", () => {
    for (const amount of ["1000000.01", "1000001", "9999999999999999.99"]) {
      const result = storeDepositSchema.safeParse({ amount })

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "amount")).toEqual([
          "MONEY_ABOVE_LIMIT",
        ])
      }
    }
  })

  it("rejects an amount that is missing or not a string", () => {
    for (const input of [{}, { amount: 2.5 }, { amount: null }]) {
      const result = storeDepositSchema.safeParse(input)

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "amount")).toContain("INVALID_MONEY")
      }
    }
  })
})

describe("useStoreDeposit", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    queryClient.setQueryData([QUERY_KEYS.WALLETS.SINGLE], previousWallet)
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    queryClient.clear()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function renderAndSubmit(
    amount: StoreDeposit["amount"] | number,
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(DepositHarness, { amount })
        )
      )
    })

    const button = container.querySelector("button")

    await act(async () => {
      button?.click()
      await vi.waitFor(() => {
        expect(container.textContent).toBe(expected)
      })
    })
  }

  function lastRequest() {
    const fetchMock = vi.mocked(fetch)
    const call = fetchMock.mock.calls.at(-1)

    if (!call) {
      throw new Error("Expected a deposit request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  it("posts the trimmed amount and replaces the wallet balances", async () => {
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(depositedWallet))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("  2.50  ", "deposited:12.50:4.00:8.50")

    const request = lastRequest()

    expect(request.url.href).toBe(
      "http://localhost:3000/backend/private/wallet/deposits"
    )
    expect(request.init.method).toBe("POST")
    expect(request.init.body).toBe(JSON.stringify({ amount: "2.50" }))
    expect(request.headers.get("Accept")).toBe("application/json")
    expect(request.headers.get("Content-Type")).toBe("application/json")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData([QUERY_KEYS.WALLETS.SINGLE])).toEqual(
      depositedWallet
    )
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.WALLETS.ALL, QUERY_KEYS.WALLETS.MOVEMENTS],
    })

    invalidateQueries.mockRestore()
  })

  it("does not call the API when the amount is invalid", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("01.50", "error:unknown")

    expect(fetchMock).not.toHaveBeenCalled()
    expect(queryClient.getQueryData([QUERY_KEYS.WALLETS.SINGLE])).toEqual(
      previousWallet
    )
  })

  it("exposes the business code when the deposit is rejected", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "AMOUNT_OUT_OF_RANGE",
          message: "The deposit exceeds the wallet balance limit.",
        },
        422
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("2.50", "error:AMOUNT_OUT_OF_RANGE")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData([QUERY_KEYS.WALLETS.SINGLE])).toEqual(
      previousWallet
    )
  })

  it("surfaces a missing session by status and does not retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("2.50", "error:401")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData([QUERY_KEYS.WALLETS.SINGLE])).toEqual(
      previousWallet
    )
  })

  it("rejects a success body that is not two-decimal money and keeps the previous wallet", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        totalBalance: "12.5",
        committedBalance: "4.00",
        availableBalance: "8.50",
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("2.50", "error:schema")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(queryClient.getQueryData([QUERY_KEYS.WALLETS.SINGLE])).toEqual(
      previousWallet
    )
  })
})
