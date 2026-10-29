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
  storeBidSchema,
  useStoreBid,
  type StoreBid,
  type StoredBid,
} from "@/src/hooks/lots/mutations/use-store-bid"
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { ApiError, ApiSchemaError } from "@/src/lib/api"
import { publicLotQueryKey } from "@/src/lib/lots/public-lot-room"
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"
const lotId = "3f1c2a4e-8b0d-4e6a-9c11-2d5f7a8b9c0d"
const bidId = "7c9e6679-7425-40de-944b-e07fc1f90ae7"

const storedBidResponse = {
  id: bidId,
  sequence: 2,
  amount: "11.50",
  createdAt: "2026-10-27T12:00:00.000Z",
  participantNo: 4,
  endsAt: "2026-10-27T18:00:00.000Z",
  extensionCount: 0,
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

function BidHarness(props: {
  id: string
  amount: StoreBid["amount"] | number
}) {
  const storeBid = useStoreBid()

  return createElement(
    "button",
    {
      id: "store-bid-submit",
      type: "button",
      onClick: () => {
        void storeBid
          .mutateAsync({
            id: props.id,
            amount: props.amount,
          } as StoreBid)
          .catch(() => undefined)
      },
    },
    storeBid.isSuccess
      ? `placed:${storeBid.data.sequence}:${storeBid.data.amount}:${storeBid.data.participantNo}:${storeBid.data.extensionCount}:${String(storeBid.data.createdAt instanceof Date)}:${String(storeBid.data.endsAt instanceof Date)}`
      : storeBid.isError
        ? `error:${
            storeBid.error instanceof ApiError
              ? ((storeBid.error.body as { code?: string }).code ??
                storeBid.error.status)
              : storeBid.error instanceof ApiSchemaError
                ? "schema"
                : "unknown"
          }`
        : "idle"
  )
}

describe("storeBidSchema", () => {
  it("accepts a positive amount with at most two decimal places", () => {
    for (const amount of [
      "0.01",
      "0.1",
      "0.10",
      "10",
      "10.5",
      "10.50",
      "1000000.00",
    ]) {
      expect(storeBidSchema.parse({ id: lotId, amount }).amount).toBe(amount)
    }
  })

  it("rejects an amount above BRL 1000000.00", () => {
    for (const amount of ["1000000.01", "1000001", "99999999.99"]) {
      const result = storeBidSchema.safeParse({ id: lotId, amount })

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "amount")).toEqual([
          "MONEY_ABOVE_LIMIT",
        ])
      }
    }
  })

  it("trims surrounding spaces before validating the amount", () => {
    expect(
      storeBidSchema.parse({ id: lotId, amount: "  10.50  " }).amount
    ).toBe("10.50")
  })

  it("rejects an amount that breaks the money rules", () => {
    for (const amount of [
      "",
      " ",
      "0",
      "0.0",
      "0.00",
      "0.001",
      "10.001",
      "-1",
      "+10.50",
      "01.50",
      "10,50",
      "1.000",
      "10.",
      "10. 50",
    ]) {
      const result = storeBidSchema.safeParse({ id: lotId, amount })

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "amount")).toContain("INVALID_MONEY")
      }
    }
  })

  it("rejects an amount that is missing or not a string", () => {
    for (const input of [
      { id: lotId },
      { id: lotId, amount: 10.5 },
      { id: lotId, amount: null },
    ]) {
      const result = storeBidSchema.safeParse(input)

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "amount")).toContain("INVALID_MONEY")
      }
    }
  })

  it("rejects a lot id that is not a UUID", () => {
    const result = storeBidSchema.safeParse({
      id: "not-a-uuid",
      amount: "10.50",
    })

    expect(result.success).toBe(false)
  })
})

describe("useStoreBid", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    sessionStorage.clear()
    sessionStorage.setItem(tokenKey, "session-token")
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
    sessionStorage.clear()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function renderAndSubmit(
    id: string,
    amount: StoreBid["amount"] | number,
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(BidHarness, { id, amount })
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
      throw new Error("Expected a bid request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  it("posts the trimmed amount and invalidates the lot and wallet", async () => {
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(storedBidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "  11.50  ", "placed:2:11.50:4:0:true:true")

    const request = lastRequest()
    const storedBid = queryClient.getMutationCache().getAll().at(-1)?.state
      .data as StoredBid

    expect(request.url.href).toBe(
      `http://localhost:3001/private/lots/${lotId}/bids`
    )
    expect(request.init.method).toBe("POST")
    expect(request.init.body).toBe(JSON.stringify({ amount: "11.50" }))
    expect(request.headers.get("Authorization")).toBe("Bearer session-token")
    expect(request.headers.get("Accept")).toBe("application/json")
    expect(request.headers.get("Content-Type")).toBe("application/json")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(storedBid).toEqual({
      id: bidId,
      sequence: 2,
      amount: "11.50",
      createdAt: new Date("2026-10-27T12:00:00.000Z"),
      participantNo: 4,
      endsAt: new Date("2026-10-27T18:00:00.000Z"),
      extensionCount: 0,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.LOTS.ALL],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.WALLETS.SINGLE],
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.WALLETS.ALL, QUERY_KEYS.WALLETS.MOVEMENTS],
    })

    invalidateQueries.mockRestore()
  })

  it("remembers the viewer number from the accepted bid", async () => {
    queryClient.setQueryData<ShowLot>(publicLotQueryKey(lotId), {
      serverNow: new Date("2026-10-27T12:00:00.000Z"),
      viewerParticipantNo: null,
      lot: {
        id: lotId,
      },
    } as ShowLot)
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(storedBidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "11.50", "placed:2:11.50:4:0:true:true")

    expect(
      queryClient.getQueryData<ShowLot>(publicLotQueryKey(lotId))
        ?.viewerParticipantNo
    ).toBe(4)
  })

  it("keeps an existing viewer number when another bid is accepted", async () => {
    queryClient.setQueryData<ShowLot>(publicLotQueryKey(lotId), {
      serverNow: new Date("2026-10-27T12:00:00.000Z"),
      viewerParticipantNo: 2,
      lot: {
        id: lotId,
      },
    } as ShowLot)
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(storedBidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "11.50", "placed:2:11.50:4:0:true:true")

    expect(
      queryClient.getQueryData<ShowLot>(publicLotQueryKey(lotId))
        ?.viewerParticipantNo
    ).toBe(2)
  })

  it("does not call the API when the amount is invalid", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "10,50", "error:unknown")

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("does not call the API when the lot id is not a UUID", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("not-a-uuid", "10.50", "error:unknown")

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("exposes the business code when the bid is rejected", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "BID_BELOW_MINIMUM",
          message: "The bid is below the minimum accepted amount.",
        },
        409
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "10.50", "error:BID_BELOW_MINIMUM")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("surfaces a missing session by status and does not retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "10.50", "error:401")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects a success body whose amount is not two-decimal money", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        ...storedBidResponse,
        amount: "11.5",
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "10.50", "error:schema")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
