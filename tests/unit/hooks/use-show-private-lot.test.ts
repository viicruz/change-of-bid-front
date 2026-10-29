// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import {
  useShowPrivateLot,
  type ShowPrivateLot,
} from "@/src/hooks/lots/queries/use-show-private-lot"

//* Local imports
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const lotId = "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f"

const privateLotResponse = {
  serverNow: "2026-10-26T15:00:00.000Z",
  lot: {
    id: lotId,
    title: "Blue-Eyes lot",
    description: null,
    openingBid: "10.00",
    minIncrement: "0.50",
    startsAt: "2026-10-26T14:00:00.000Z",
    endsAt: "2026-10-26T16:00:00.000Z",
    extensionCount: 0,
    status: "LIVE",
    currentBid: "15.00",
    leaderParticipantNo: 4,
    bidCount: 2,
    sold: false,
    winnerParticipantNo: null,
    receivedAmount: null,
    items: [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        position: 1,
        cardId: 89631139,
        quantity: 1,
        cardName: "Blue-Eyes White Dragon",
        imagePath: "https://images.example/blue-eyes.jpg",
        cardSnapshot: {
          id: 89631139,
          name: "Blue-Eyes White Dragon",
          atk: 3000,
        },
      },
    ],
    bids: [
      {
        sequence: 1,
        amount: "10.00",
        createdAt: "2026-10-26T14:10:00.000Z",
        participantNo: 2,
      },
      {
        sequence: 2,
        amount: "15.00",
        createdAt: "2026-10-26T14:20:00.000Z",
        participantNo: 4,
      },
    ],
  },
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function queryKey(id: string) {
  return [
    QUERY_KEYS.LOTS.ALL,
    QUERY_KEYS.LOTS.PRIVATE,
    QUERY_KEYS.LOTS.SINGLE,
    id,
  ]
}

function ShowPrivateLotHarness(props: { id: string; enabled?: boolean }) {
  const privateLot = useShowPrivateLot(props)
  const payload = privateLot.data

  return createElement(
    "div",
    { id: "private-lot-state" },
    privateLot.isSuccess && payload
      ? `success:${payload.lot.status}:${payload.lot.bidCount}:${payload.lot.currentBid ?? "none"}:${payload.lot.sold}:${payload.lot.receivedAmount ?? "none"}:${String(payload.serverNow instanceof Date)}:${String(payload.lot.endsAt instanceof Date)}`
      : privateLot.isError
        ? "error"
        : "pending"
  )
}

describe("useShowPrivateLot", () => {
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
    props: { id: string; enabled?: boolean },
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(ShowPrivateLotHarness, props)
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
      throw new Error("Expected a private lot request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  describe("when the auctioneer owns the lot", () => {
    it("requests that lot by id with no query or body and keeps the snapshot", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(privateLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:none:true:true"
      )

      const request = lastRequest()
      const cached = queryClient.getQueryData<ShowPrivateLot>(queryKey(lotId))

      expect(request.url.href).toBe(
        `http://localhost:3000/backend/private/lots/${lotId}`
      )
      expect(request.url.search).toBe("")
      expect(request.init.method).toBe("GET")
      expect(request.init.body).toBeUndefined()
      expect(request.headers.get("Accept")).toBe("application/json")
      expect(request.headers.get("Content-Type")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(cached?.serverNow).toEqual(new Date("2026-10-26T15:00:00.000Z"))
      expect(cached?.lot.openingBid).toBe("10.00")
      expect(cached?.lot.minIncrement).toBe("0.50")
      expect(cached?.lot.currentBid).toBe("15.00")
      expect(cached?.lot.description).toBeNull()
      expect(cached?.lot.extensionCount).toBe(0)
      expect(cached?.lot.leaderParticipantNo).toBe(4)
      expect(cached?.lot.winnerParticipantNo).toBeNull()
      expect(cached?.lot.startsAt).toEqual(new Date("2026-10-26T14:00:00.000Z"))
      expect(cached?.lot.bids.map((bid) => bid.sequence)).toEqual([1, 2])
      expect(cached?.lot.bids.map((bid) => bid.amount)).toEqual([
        "10.00",
        "15.00",
      ])
      expect(cached?.lot.bids.map((bid) => bid.participantNo)).toEqual([2, 4])
      expect(cached?.lot.bids[1]?.createdAt).toEqual(
        new Date("2026-10-26T14:20:00.000Z")
      )
      expect(cached?.lot.items[0]?.cardSnapshot).toEqual({
        id: 89631139,
        name: "Blue-Eyes White Dragon",
        atk: 3000,
      })
    })

    it("accepts a scheduled lot that has no bids", async () => {
      const response = {
        ...privateLotResponse,
        serverNow: "2026-10-26T13:00:00.000Z",
        lot: {
          ...privateLotResponse.lot,
          status: "SCHEDULED",
          currentBid: null,
          leaderParticipantNo: null,
          bidCount: 0,
          bids: [],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:SCHEDULED:0:none:false:none:true:true"
      )

      const cached = queryClient.getQueryData<ShowPrivateLot>(queryKey(lotId))

      expect(cached?.lot.bids).toEqual([])
      expect(cached?.lot.leaderParticipantNo).toBeNull()
    })

    it("accepts an ended lot that closed without a winner", async () => {
      const response = {
        ...privateLotResponse,
        serverNow: "2026-10-26T16:00:00.000Z",
        lot: {
          ...privateLotResponse.lot,
          status: "ENDED",
          sold: false,
          winnerParticipantNo: null,
          receivedAmount: null,
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:ENDED:2:15.00:false:none:true:true"
      )
    })

    it("accepts a sold lot with the winner number and credited amount", async () => {
      const response = {
        ...privateLotResponse,
        serverNow: "2026-10-26T16:30:00.000Z",
        lot: {
          ...privateLotResponse.lot,
          status: "ENDED",
          sold: true,
          winnerParticipantNo: 4,
          receivedAmount: "15.00",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:ENDED:2:15.00:true:15.00:true:true"
      )
    })

    it("accepts a canceled lot and a zero credited amount", async () => {
      const response = {
        ...privateLotResponse,
        lot: {
          ...privateLotResponse.lot,
          status: "CANCELED",
          sold: true,
          winnerParticipantNo: 4,
          receivedAmount: "0.00",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:CANCELED:2:15.00:true:0.00:true:true"
      )
    })

    it("keeps unknown catalog fields on the card snapshot", async () => {
      const response = {
        ...privateLotResponse,
        lot: {
          ...privateLotResponse.lot,
          items: [
            {
              ...privateLotResponse.lot.items[0],
              cardSnapshot: {
                name: "Blue-Eyes White Dragon",
                def: 2500,
                attribute: "LIGHT",
              },
            },
          ],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:none:true:true"
      )

      const cached = queryClient.getQueryData<ShowPrivateLot>(queryKey(lotId))

      expect(cached?.lot.items[0]?.cardSnapshot).toEqual({
        name: "Blue-Eyes White Dragon",
        def: 2500,
        attribute: "LIGHT",
      })
    })
  })

  describe("when the server rejects the request", () => {
    it("surfaces a missing session and does not retry", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response("", { status: 401 }))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("surfaces a signed-in user who is not an auctioneer and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            code: "NOT_AUCTIONEER",
            message: "Only an auctioneer can view their lot.",
          },
          403
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("surfaces a lot owned by another auctioneer and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            code: "LOT_NOT_OWNED",
            message: "Only the owner can view this lot.",
          },
          403
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("surfaces a missing lot and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            code: "LOT_NOT_FOUND",
            message: "Lot was not found.",
          },
          404
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("surfaces an invalid id response and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            type: "validation",
            message: "Validation failure.",
          },
          422
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the response does not match the contract", () => {
    it("rejects a lot status that the private route does not accept", async () => {
      const response = {
        ...privateLotResponse,
        lot: {
          ...privateLotResponse.lot,
          status: "ACTIVE",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("rejects money that is not a two-decimal string", async () => {
      const response = {
        ...privateLotResponse,
        lot: {
          ...privateLotResponse.lot,
          openingBid: "10",
          currentBid: 15,
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("rejects an item that has no card snapshot", async () => {
      const response = {
        ...privateLotResponse,
        lot: {
          ...privateLotResponse.lot,
          items: [
            {
              id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              position: 1,
              cardId: 89631139,
              quantity: 1,
              cardName: "Blue-Eyes White Dragon",
              imagePath: "https://images.example/blue-eyes.jpg",
            },
          ],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the query should stay idle", () => {
    it("does not request the lot when the query is disabled", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(privateLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowPrivateLotHarness, {
              id: lotId,
              enabled: false,
            })
          )
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("pending")
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("does not request the lot when the id is not a uuid", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(privateLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowPrivateLotHarness, { id: "not-a-uuid" })
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
})
