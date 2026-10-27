// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"
const lotId = "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f"

const publicLotResponse = {
  serverNow: "2026-10-27T12:00:00.000Z",
  viewerParticipantNo: 6,
  lot: {
    id: lotId,
    title: "Room Dragon",
    description: null,
    openingBid: "10.00",
    minIncrement: "1.00",
    startsAt: "2026-10-27T13:00:00.000Z",
    endsAt: "2026-10-27T15:00:00.000Z",
    extensionCount: 0,
    status: "LIVE",
    currentBid: "15.00",
    leaderParticipantNo: 4,
    bidCount: 2,
    sold: false,
    winnerParticipantNo: null,
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
        createdAt: "2026-10-27T13:10:00.000Z",
        participantNo: 2,
      },
      {
        sequence: 2,
        amount: "15.00",
        createdAt: "2026-10-27T13:20:00.000Z",
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
  return [QUERY_KEYS.LOTS.ALL, QUERY_KEYS.LOTS.SINGLE, id]
}

function ShowLotHarness(props: { id: string; enabled?: boolean }) {
  const lot = useShowLot(props)
  const payload = lot.data

  return createElement(
    "div",
    { id: "public-lot-state" },
    lot.isSuccess && payload
      ? `success:${payload.lot.status}:${payload.lot.bidCount}:${payload.lot.currentBid ?? "none"}:${payload.lot.sold}:${payload.viewerParticipantNo ?? "none"}:${payload.lot.items.length}:${String(payload.serverNow instanceof Date)}:${String(payload.lot.endsAt instanceof Date)}`
      : lot.isError
        ? "error"
        : "pending"
  )
}

describe("useShowLot", () => {
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

  async function renderAndWait(
    props: { id: string; enabled?: boolean },
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(QueryProvider, null, createElement(ShowLotHarness, props))
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
      throw new Error("Expected a public lot request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  describe("when the public lot exists", () => {
    it("requests that lot by id with no query or body and keeps the snapshot", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:6:1:true:true"
      )

      const request = lastRequest()
      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      expect(request.url.href).toBe(
        `http://localhost:3001/public/lots/${lotId}`
      )
      expect(request.url.search).toBe("")
      expect(request.init.method).toBe("GET")
      expect(request.init.body).toBeUndefined()
      expect(request.headers.get("Authorization")).toBe("Bearer session-token")
      expect(request.headers.get("Accept")).toBe("application/json")
      expect(request.headers.get("Content-Type")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(cached?.serverNow).toEqual(new Date("2026-10-27T12:00:00.000Z"))
      expect(cached?.viewerParticipantNo).toBe(6)
      expect(cached?.lot.openingBid).toBe("10.00")
      expect(cached?.lot.minIncrement).toBe("1.00")
      expect(cached?.lot.currentBid).toBe("15.00")
      expect(cached?.lot.description).toBeNull()
      expect(cached?.lot.extensionCount).toBe(0)
      expect(cached?.lot.leaderParticipantNo).toBe(4)
      expect(cached?.lot.winnerParticipantNo).toBeNull()
      expect(cached?.lot.startsAt).toEqual(new Date("2026-10-27T13:00:00.000Z"))
      expect(cached?.lot.bids.map((bid) => bid.sequence)).toEqual([1, 2])
      expect(cached?.lot.bids.map((bid) => bid.amount)).toEqual([
        "10.00",
        "15.00",
      ])
      expect(cached?.lot.bids.map((bid) => bid.participantNo)).toEqual([2, 4])
      expect(cached?.lot.bids[1]?.createdAt).toEqual(
        new Date("2026-10-27T13:20:00.000Z")
      )
      expect(cached?.lot.items[0]?.cardSnapshot).toEqual({
        id: 89631139,
        name: "Blue-Eyes White Dragon",
        atk: 3000,
      })
    })

    it("keeps a newer cached snapshot when an older read resolves", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:6:1:true:true"
      )

      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      if (!cached) {
        throw new Error("Expected a cached lot")
      }

      queryClient.setQueryData<ShowLot>(queryKey(lotId), {
        ...cached,
        serverNow: new Date("2026-10-27T18:00:00.000Z"),
        viewerParticipantNo: 9,
        lot: {
          ...cached.lot,
          currentBid: "30.00",
          bidCount: 4,
        },
      })
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...publicLotResponse,
          viewerParticipantNo: null,
        })
      )

      await act(async () => {
        await queryClient.refetchQueries({ queryKey: queryKey(lotId) })
        await new Promise((resolve) => {
          setTimeout(resolve, 0)
        })
      })

      expect(container.textContent).toBe(
        "success:LIVE:4:30.00:false:9:1:true:true"
      )
      expect(
        queryClient.getQueryData<ShowLot>(queryKey(lotId))?.lot.currentBid
      ).toBe("30.00")
    })

    it("keeps a remembered viewer number when a newer read has none", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:6:1:true:true"
      )

      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      if (!cached) {
        throw new Error("Expected a cached lot")
      }

      queryClient.setQueryData<ShowLot>(queryKey(lotId), {
        ...cached,
        viewerParticipantNo: 9,
      })
      fetchMock.mockResolvedValue(
        jsonResponse({
          ...publicLotResponse,
          serverNow: "2026-10-27T13:00:00.000Z",
          viewerParticipantNo: null,
          lot: {
            ...publicLotResponse.lot,
            currentBid: "40.00",
            bidCount: 5,
          },
        })
      )

      await act(async () => {
        await queryClient.refetchQueries({ queryKey: queryKey(lotId) })
        await new Promise((resolve) => {
          setTimeout(resolve, 0)
        })
      })

      expect(container.textContent).toBe(
        "success:LIVE:5:40.00:false:9:1:true:true"
      )
    })

    it("accepts a scheduled lot that has no bids and no items", async () => {
      const response = {
        ...publicLotResponse,
        serverNow: "2026-10-27T12:00:00.000Z",
        lot: {
          ...publicLotResponse.lot,
          status: "SCHEDULED",
          currentBid: null,
          leaderParticipantNo: null,
          bidCount: 0,
          items: [],
          bids: [],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:SCHEDULED:0:none:false:6:0:true:true"
      )

      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      expect(cached?.lot.bids).toEqual([])
      expect(cached?.lot.items).toEqual([])
      expect(cached?.lot.leaderParticipantNo).toBeNull()
    })

    it("accepts an ended lot that closed without a winner", async () => {
      const response = {
        ...publicLotResponse,
        serverNow: "2026-10-27T15:00:00.000Z",
        lot: {
          ...publicLotResponse.lot,
          status: "ENDED",
          sold: false,
          winnerParticipantNo: null,
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:ENDED:2:15.00:false:6:1:true:true"
      )
    })

    it("accepts a sold lot with the winner number", async () => {
      const response = {
        ...publicLotResponse,
        serverNow: "2026-10-27T15:30:00.000Z",
        lot: {
          ...publicLotResponse.lot,
          status: "ENDED",
          sold: true,
          winnerParticipantNo: 4,
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:ENDED:2:15.00:true:6:1:true:true"
      )

      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      expect(cached?.lot.winnerParticipantNo).toBe(4)
      expect(cached?.lot.sold).toBe(true)
    })

    it("accepts a canceled lot that still has bids and was not sold", async () => {
      const response = {
        ...publicLotResponse,
        lot: {
          ...publicLotResponse.lot,
          status: "CANCELED",
          sold: false,
          winnerParticipantNo: null,
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:CANCELED:2:15.00:false:6:1:true:true"
      )
    })

    it("keeps unknown catalog fields on the card snapshot", async () => {
      const response = {
        ...publicLotResponse,
        lot: {
          ...publicLotResponse.lot,
          items: [
            {
              ...publicLotResponse.lot.items[0],
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
        "success:LIVE:2:15.00:false:6:1:true:true"
      )

      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      expect(cached?.lot.items[0]?.cardSnapshot).toEqual({
        name: "Blue-Eyes White Dragon",
        def: 2500,
        attribute: "LIGHT",
      })
    })

    it("returns a null viewer number when the signed-in user has not joined the lot", async () => {
      const response = {
        ...publicLotResponse,
        viewerParticipantNo: null,
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:none:1:true:true"
      )

      const request = lastRequest()

      expect(request.headers.get("Authorization")).toBe("Bearer session-token")
    })
  })

  describe("when there is no session", () => {
    it("still loads the lot and leaves the viewer number empty", async () => {
      sessionStorage.clear()
      const response = {
        ...publicLotResponse,
        viewerParticipantNo: null,
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:LIVE:2:15.00:false:none:1:true:true"
      )

      const request = lastRequest()
      const cached = queryClient.getQueryData<ShowLot>(queryKey(lotId))

      expect(request.headers.get("Authorization")).toBeNull()
      expect(cached?.viewerParticipantNo).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the server rejects the request", () => {
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
    it("rejects a lot status that the public route does not accept", async () => {
      const response = {
        ...publicLotResponse,
        lot: {
          ...publicLotResponse.lot,
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
        ...publicLotResponse,
        lot: {
          ...publicLotResponse.lot,
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
        ...publicLotResponse,
        lot: {
          ...publicLotResponse.lot,
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
        .mockResolvedValue(jsonResponse(publicLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowLotHarness, {
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
        .mockResolvedValue(jsonResponse(publicLotResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowLotHarness, { id: "not-a-uuid" })
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
