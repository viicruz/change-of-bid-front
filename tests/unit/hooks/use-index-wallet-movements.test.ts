// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useIndexWalletMovements } from "@/src/hooks/wallets/queries/use-index-wallet-movements"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

const lotId = "11111111-1111-4111-8111-111111111111"
const bidId = "22222222-2222-4222-8222-222222222222"

const movementsResponse = {
  movements: [
    {
      id: "6f1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e5f",
      type: "HOLD",
      amount: "2.00",
      lotId,
      bidId,
      createdAt: "2026-04-02T00:00:00.000Z",
    },
  ],
  page: 2,
  limit: 20,
  total: 5,
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function MovementsHarness(props: { page?: number; limit?: number }) {
  const movements = useIndexWalletMovements(props)
  const payload = movements.data
  const first = payload?.movements[0]
  const firstMovement = first
    ? `${first.type}:${first.amount}:${typeof first.createdAt}`
    : "empty"

  return createElement(
    "div",
    { id: "wallet-movements-state" },
    movements.isSuccess && payload
      ? `success:${payload.movements.length}:${payload.page}:${payload.limit}:${payload.total}:${firstMovement}`
      : movements.isError
        ? "error"
        : "pending"
  )
}

function DisabledMovementsHarness() {
  const movements = useIndexWalletMovements({ enabled: false })

  return createElement(
    "div",
    { id: "wallet-movements-state" },
    movements.isPending ? "pending" : "requested"
  )
}

describe("useIndexWalletMovements", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
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

  async function renderAndWait(
    props: { page?: number; limit?: number },
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(MovementsHarness, props)
        )
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toBe(expected)
      })
    })
  }

  function lastRequest() {
    const fetchMock = vi.mocked(fetch)
    const call = fetchMock.mock.calls.at(-1)

    if (!call) {
      throw new Error("Expected a wallet movements request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  it("requests one authenticated page and keeps amount and createdAt as strings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(movementsResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(
      { page: 2, limit: 20 },
      "success:1:2:20:5:HOLD:2.00:string"
    )

    const request = lastRequest()

    expect(request.url.href).toBe(
      "http://localhost:3000/backend/private/wallet/movements?page=2&limit=20"
    )
    expect(request.init.method).toBe("GET")
    expect(request.init.body).toBeUndefined()
    expect(request.headers.get("Accept")).toBe("application/json")
    expect(request.headers.get("Content-Type")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("sends the documented defaults when page and limit are omitted", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...movementsResponse,
        page: 1,
        limit: 20,
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({}, "success:1:1:20:5:HOLD:2.00:string")

    expect(lastRequest().url.href).toBe(
      "http://localhost:3000/backend/private/wallet/movements?page=1&limit=20"
    )
  })

  it("accepts an empty page past the last movement", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        movements: [],
        page: 3,
        limit: 20,
        total: 5,
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ page: 3 }, "success:0:3:20:5:empty")

    expect(lastRequest().url.searchParams.get("page")).toBe("3")
    expect(lastRequest().url.searchParams.get("limit")).toBe("20")
  })

  it("surfaces a missing session and does not retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ page: 1 }, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("surfaces a missing wallet row and does not retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "WALLET_NOT_FOUND",
          message: "Wallet was not found.",
        },
        404
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({}, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("surfaces an invalid page or limit and does not retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          type: "validation",
          message: "Validation failed.",
        },
        422
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ page: 0, limit: 51 }, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lastRequest().url.searchParams.get("page")).toBe("0")
    expect(lastRequest().url.searchParams.get("limit")).toBe("51")
  })

  it("rejects an amount that is not a two-decimal money string and does not retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...movementsResponse,
        movements: [
          {
            ...movementsResponse.movements[0],
            amount: 2,
          },
        ],
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ page: 2 }, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects a hold that is missing its bid and does not retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...movementsResponse,
        movements: [
          {
            ...movementsResponse.movements[0],
            bidId: null,
          },
        ],
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ page: 2 }, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not request movements when the query is disabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(movementsResponse))
    vi.stubGlobal("fetch", fetchMock)

    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(DisabledMovementsHarness)
        )
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toBe("pending")
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
