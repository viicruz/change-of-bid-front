// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { AuctionRoom } from "@/src/components/auction/auction-room"
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Message imports
import enMessages from "@/messages/en.json"

//* Local imports
import { ApiError, api } from "@/src/lib/api"
import { queryClient } from "@/src/lib/query-client"

const authSession = vi.hoisted(() => ({
  data: null as { user: { role: string } } | null,
  isPending: false,
  isRefetching: false,
  error: null,
  refetch: vi.fn(),
}))

vi.mock("@/src/hooks/auth/use-auth-session", () => ({
  useAuthSession: () => authSession,
}))

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) =>
    createElement("img", { alt: props.alt, src: props.src }),
}))

vi.mock("@/src/lib/api", async () => {
  const actual =
    await vi.importActual<typeof import("@/src/lib/api")>("@/src/lib/api")

  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: actual.api.post,
    },
  }
})

const lotId = "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f"

type SocketListener = (event: Event) => void

class FakeSocket {
  static instances: FakeSocket[] = []

  readonly url: string
  private listeners = new Map<string, Set<SocketListener>>()

  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }

  addEventListener(type: string, listener: SocketListener) {
    const current = this.listeners.get(type) ?? new Set<SocketListener>()
    current.add(listener)
    this.listeners.set(type, current)
  }

  close(code = 1000) {
    this.dispatch("close", { code })
  }

  dispatch(type: string, event: object) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event as Event)
    }
  }
}

function latestSocket() {
  const socket = FakeSocket.instances.at(-1)

  if (!socket) {
    throw new Error("Expected a lot socket")
  }

  return socket
}

function liveFrame(lot: ShowLot["lot"], serverNow: string) {
  return JSON.stringify({
    serverNow,
    lot: {
      ...lot,
      startsAt: lot.startsAt.toISOString(),
      endsAt: lot.endsAt.toISOString(),
      bids: lot.bids.map((bid) => ({
        ...bid,
        createdAt: bid.createdAt.toISOString(),
      })),
    },
  })
}

function publicLot(overrides: Partial<ShowLot["lot"]> = {}): ShowLot {
  return {
    serverNow: new Date("2026-10-27T12:00:00.000Z"),
    viewerParticipantNo: 6,
    lot: {
      id: lotId,
      title: "Room Dragon",
      description: "A dragon room.",
      openingBid: "10.00",
      minIncrement: "1.00",
      startsAt: new Date("2026-10-27T13:00:00.000Z"),
      endsAt: new Date("2026-10-27T15:00:00.000Z"),
      extensionCount: 0,
      status: "LIVE",
      currentBid: "15.00",
      leaderParticipantNo: 4,
      bidCount: 2,
      sold: false,
      winnerParticipantNo: null,
      items: [
        {
          id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          position: 2,
          cardId: 5318639,
          quantity: 2,
          cardName: "Mystical Space Typhoon",
          imagePath: "https://images.ygoprodeck.com/images/cards/5318639.jpg",
          cardSnapshot: { name: "Mystical Space Typhoon" },
        },
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          position: 1,
          cardId: 89631139,
          quantity: 1,
          cardName: "Blue-Eyes White Dragon",
          imagePath: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
          cardSnapshot: { name: "Blue-Eyes White Dragon" },
        },
      ],
      bids: [
        {
          sequence: 1,
          amount: "10.00",
          createdAt: new Date("2026-10-27T13:10:00.000Z"),
          participantNo: 2,
        },
        {
          sequence: 2,
          amount: "15.00",
          createdAt: new Date("2026-10-27T13:20:00.000Z"),
          participantNo: 4,
        },
      ],
      ...overrides,
    },
  }
}

function RoomHarness(props: { id: string }) {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
      timeZone: "UTC",
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(
      QueryProvider,
      null,
      createElement(AuctionRoom, { id: props.id })
    )
  )
}

describe("AuctionRoom", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    authSession.data = null
    authSession.isPending = false
    queryClient.clear()
    FakeSocket.instances = []
    vi.stubGlobal("WebSocket", FakeSocket)
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

  async function renderRoom(id: string) {
    act(() => {
      root.render(createElement(RoomHarness, { id }))
    })
  }

  describe("when the public lot is live", () => {
    it("shows the title, status, cards in position order, and bids in sequence order", async () => {
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-room-name")?.textContent
          ).toBe("Room Dragon")
        })
      })

      expect(container.querySelector("#auction-room-status")?.textContent).toBe(
        "Live"
      )
      expect(
        container.querySelector("#lot-description")?.textContent
      ).toContain("A dragon room.")
      expect(
        container.querySelector("#current-bid-value")?.textContent
      ).toContain("15.00")
      expect(
        container.querySelector("#viewer-participant")?.textContent
      ).toContain("Your number")
      expect(
        container.querySelector("#viewer-participant")?.textContent
      ).toContain("6")
      expect(container.querySelector("#place-bid")).toBeInstanceOf(
        HTMLButtonElement
      )
      expect(container.querySelector("#place-bid")?.getAttribute("type")).toBe(
        "submit"
      )

      const list = container.querySelector("#lot-items")
      const items = container.querySelectorAll("#lot-items > li")
      const images = container.querySelectorAll("#lot-items img")

      expect(list?.className).toContain("grid")
      expect(items[0]?.textContent).toContain("Blue-Eyes White Dragon")
      expect(items[1]?.textContent).toContain("Mystical Space Typhoon")
      expect(images[0]?.getAttribute("src")).toContain("89631139")
      expect(images[1]?.getAttribute("src")).toContain("5318639")
      expect(
        container.querySelector(
          "#lot-item-quantity-a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )?.textContent
      ).toContain("1")
      expect(container.innerHTML.indexOf("auction-bid-1")).toBeLessThan(
        container.innerHTML.indexOf("auction-bid-2")
      )
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/public/lots/${lotId}`,
        })
      )
    })

    it("marks the viewer's bid, the leader, and the winner", async () => {
      const lot = publicLot({
        status: "ENDED",
        sold: true,
        winnerParticipantNo: 6,
        leaderParticipantNo: 6,
        bids: [
          {
            sequence: 1,
            amount: "10.00",
            createdAt: new Date("2026-10-27T13:10:00.000Z"),
            participantNo: 2,
          },
          {
            sequence: 2,
            amount: "15.00",
            createdAt: new Date("2026-10-27T13:20:00.000Z"),
            participantNo: 6,
          },
        ],
      })
      vi.mocked(api.get).mockResolvedValue({
        ...lot,
        viewerParticipantNo: 6,
      })

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-winner")).not.toBeNull()
        })
      })

      expect(
        container.querySelector("#lot-leader")?.getAttribute("data-yours")
      ).toBe("true")
      expect(container.querySelector("#lot-leader")?.textContent).toContain(
        "You"
      )
      expect(
        container.querySelector("#lot-winner")?.getAttribute("data-yours")
      ).toBe("true")
      expect(container.querySelector("#lot-winner")?.textContent).toContain("6")
      expect(container.querySelector("#lot-winner")?.textContent).toContain(
        "You"
      )
      expect(
        container.querySelector("#auction-bid-1")?.getAttribute("data-yours")
      ).toBe("false")
      expect(
        container.querySelector("#auction-bid-2")?.getAttribute("data-yours")
      ).toBe("true")
      expect(container.querySelector("#auction-bid-2")?.textContent).toContain(
        "You"
      )
      expect(container.querySelector("#place-bid")).toBeNull()
    })

    it("keeps the bid form available for a bidder", async () => {
      authSession.data = { user: { role: "BIDDER" } }
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#place-bid")).toBeInstanceOf(
            HTMLButtonElement
          )
        })
      })

      expect(container.querySelector("#auctioneer-bid-lock")).toBeNull()
      expect(container.querySelector("#bid-amount")).toBeInstanceOf(
        HTMLInputElement
      )
    })
  })

  describe("when the signed-in user is an auctioneer", () => {
    it("blocks the bid form on a live lot and explains why", async () => {
      authSession.data = { user: { role: "AUCTIONEER" } }
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auctioneer-bid-lock-message")?.textContent
          ).toBe(
            "Auctioneers can follow this lot, but only a bidder can place a bid."
          )
        })
      })

      expect(container.querySelector("#auctioneer-bid-lock")).not.toBeNull()
      expect(container.querySelector("#place-bid")).toBeNull()
      expect(container.querySelector("#place-bid-form")).toBeNull()
      expect(container.querySelector("#bid-amount")).toBeNull()
      expect(
        container.querySelector("#current-bid-value")?.textContent
      ).toContain("15.00")
      expect(container.querySelector("#bid-history")).not.toBeNull()
    })

    it("hides the bid form while the session is still loading", async () => {
      authSession.isPending = true
      authSession.data = { user: { role: "AUCTIONEER" } }
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#current-bid-value")).not.toBeNull()
        })
      })

      expect(container.querySelector("#place-bid")).toBeNull()
      expect(container.querySelector("#auctioneer-bid-lock")).toBeNull()
    })
  })

  describe("when the viewer places a bid", () => {
    const storedBidResponse = {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      sequence: 3,
      amount: "16.50",
      createdAt: "2026-10-27T12:00:00.000Z",
      participantNo: 6,
      endsAt: "2026-10-27T18:00:00.000Z",
      extensionCount: 0,
    }

    function jsonResponse(body: unknown, status = 201) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })
    }

    function setInputValue(input: HTMLInputElement, value: string) {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set

      valueSetter?.call(input, value)
      input.dispatchEvent(new Event("input", { bubbles: true }))
      input.dispatchEvent(new Event("change", { bubbles: true }))
    }

    async function showLiveRoom() {
      vi.mocked(api.get).mockResolvedValue(publicLot())
      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#bid-amount")).toBeInstanceOf(
            HTMLInputElement
          )
        })
      })
    }

    async function submitBid(value: string) {
      const amount = container.querySelector("#bid-amount")
      const form = container.querySelector("#place-bid-form")

      expect(amount).toBeInstanceOf(HTMLInputElement)
      expect(form).toBeInstanceOf(HTMLFormElement)

      await act(async () => {
        setInputValue(amount as HTMLInputElement, value)
      })

      await act(async () => {
        ;(form as HTMLFormElement).dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        )
      })
    }

    it("posts the trimmed amount and clears the field", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(storedBidResponse))
      vi.stubGlobal("fetch", fetchMock)

      await showLiveRoom()
      await submitBid("  16.50  ")

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            (container.querySelector("#bid-amount") as HTMLInputElement).value
          ).toBe("")
        })
      })

      const call = fetchMock.mock.calls.at(-1) as [URL, RequestInit] | undefined

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(call?.[0].href).toBe(
        `http://localhost:3001/private/lots/${lotId}/bids`
      )
      expect(call?.[1].method).toBe("POST")
      expect(call?.[1].body).toBe(JSON.stringify({ amount: "16.50" }))
    })

    it("shows an invalid money message and does not call the API", async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal("fetch", fetchMock)

      await showLiveRoom()
      await submitBid("10,50")

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#bid-amount-error")?.textContent
          ).toBe(
            "Money values must be greater than zero and have at most 2 decimal places."
          )
        })
      })

      expect(fetchMock).not.toHaveBeenCalled()
      expect(container.querySelector("#place-bid-error")).toBeNull()
    })

    it("shows the page message when the bid is below the minimum and leaves the room unchanged", async () => {
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

      await showLiveRoom()
      await submitBid("10.50")

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#place-bid-error")?.textContent).toBe(
            "The bid is below the minimum accepted amount."
          )
        })
      })

      expect(container.querySelector("#bid-amount-error")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(
        container.querySelector("#current-bid-value")?.textContent
      ).toContain("15.00")
    })
  })

  describe("when the lot has no bids", () => {
    it("shows an empty history and no current bid", async () => {
      vi.mocked(api.get).mockResolvedValue(
        publicLot({
          status: "SCHEDULED",
          currentBid: null,
          leaderParticipantNo: null,
          bidCount: 0,
          bids: [],
          description: null,
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#bid-history-empty")?.textContent
          ).toBe("No bids yet.")
        })
      })

      expect(
        container.querySelector("#current-bid-value")?.textContent
      ).toContain("No current bid.")
      expect(container.querySelector("#lot-description")).toBeNull()
      expect(container.querySelector("#lot-leader")).toBeNull()
      expect(container.querySelector("#place-bid")).toBeNull()
      expect(container.querySelector("#auction-room-status")?.textContent).toBe(
        "Pending"
      )
    })
  })

  describe("when the lot cannot be loaded", () => {
    it("shows a missing lot message when the server returns 404", async () => {
      vi.mocked(api.get).mockRejectedValue(
        new ApiError(404, "Lot was not found.", {
          code: "LOT_NOT_FOUND",
          message: "Lot was not found.",
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-room-error")?.textContent
          ).toBe("Lot was not found.")
        })
      })

      expect(container.textContent).not.toContain("Could not load the lot.")
    })

    it("shows a generic error when the request fails for another reason", async () => {
      vi.useFakeTimers()

      try {
        vi.mocked(api.get).mockRejectedValue(
          new ApiError(500, "Unavailable", { message: "Unavailable" })
        )

        await renderRoom(lotId)

        await act(async () => {
          await vi.advanceTimersByTimeAsync(8000)
        })

        expect(
          container.querySelector("#auction-room-error")?.textContent
        ).toBe("Could not load the lot.")
      } finally {
        vi.useRealTimers()
      }
    })

    it("shows a missing lot message and does not request when the id is not a uuid", async () => {
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom("not-a-uuid")

      await act(async () => {
        await Promise.resolve()
      })

      expect(
        container.querySelector("#auction-room-missing")?.textContent
      ).toBe("Lot was not found.")
      expect(api.get).not.toHaveBeenCalled()
      expect(FakeSocket.instances).toHaveLength(0)
    })
  })

  describe("when the lot is still loading", () => {
    it("shows a loading message until the lot arrives", async () => {
      let resolveLot: (lot: ShowLot) => void = () => {}
      vi.mocked(api.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveLot = resolve
          })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-room-loading")?.textContent
          ).toBe("Loading lot.")
        })
      })

      await act(async () => {
        resolveLot(publicLot())
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-room-name")?.textContent
          ).toBe("Room Dragon")
        })
      })
    })
  })

  describe("when the live room changes", () => {
    it("applies a newer snapshot without dropping the viewer number", async () => {
      const room = publicLot()
      vi.mocked(api.get).mockResolvedValue(room)

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-leadership")?.textContent
          ).toBe("Bidder #4")
        })
      })

      const nextLot: ShowLot["lot"] = {
        ...room.lot,
        currentBid: "20.00",
        leaderParticipantNo: 8,
        bidCount: 3,
        endsAt: new Date("2026-10-27T12:07:00.000Z"),
        bids: [
          ...room.lot.bids,
          {
            sequence: 3,
            amount: "20.00",
            createdAt: new Date("2026-10-27T12:05:00.000Z"),
            participantNo: 8,
          },
        ],
      }

      await act(async () => {
        latestSocket().dispatch("message", {
          data: liveFrame(nextLot, "2026-10-27T12:05:00.000Z"),
        })
        await new Promise((resolve) => {
          setTimeout(resolve, 0)
        })
      })

      expect(
        container.querySelector("#current-bid-value")?.textContent
      ).toContain("20.00")
      expect(container.querySelector("#auction-leadership")?.textContent).toBe(
        "Bidder #8"
      )
      expect(
        container.querySelector("#viewer-participant")?.textContent
      ).toContain("6")
      expect(container.querySelector("#auction-bid-3")?.textContent).toContain(
        "20.00"
      )
      expect(container.querySelector("#auction-countdown")?.textContent).toBe(
        "Ends in 02:00"
      )
      expect(container.querySelector("#place-bid-error")).toBeNull()
    })

    it("says the viewer is winning and closes bidding", async () => {
      vi.mocked(api.get).mockResolvedValue(
        publicLot({
          leaderParticipantNo: 6,
          bids: [
            {
              sequence: 1,
              amount: "10.00",
              createdAt: new Date("2026-10-27T13:10:00.000Z"),
              participantNo: 4,
            },
            {
              sequence: 2,
              amount: "15.00",
              createdAt: new Date("2026-10-27T13:20:00.000Z"),
              participantNo: 6,
            },
          ],
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-leadership")?.textContent
          ).toBe("You are winning")
        })
      })

      expect(container.querySelector("#place-bid")).toBeNull()
    })

    it("says the viewer was outbid", async () => {
      vi.mocked(api.get).mockResolvedValue(
        publicLot({
          leaderParticipantNo: 4,
          bids: [
            {
              sequence: 1,
              amount: "10.00",
              createdAt: new Date("2026-10-27T13:10:00.000Z"),
              participantNo: 6,
            },
            {
              sequence: 2,
              amount: "15.00",
              createdAt: new Date("2026-10-27T13:20:00.000Z"),
              participantNo: 4,
            },
          ],
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-leadership")?.textContent
          ).toBe("You were outbid")
        })
      })

      expect(container.querySelector("#place-bid")).toBeInstanceOf(
        HTMLButtonElement
      )
    })

    it("keeps the last snapshot and shows that the room is reconnecting", async () => {
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#auction-room-name")).not.toBeNull()
        })
      })

      vi.useFakeTimers()

      try {
        await act(async () => {
          latestSocket().dispatch("open", {})
          latestSocket().dispatch("close", { code: 1006 })
        })

        expect(
          container.querySelector("#auction-connection")?.textContent
        ).toBe("Reconnecting...")
        expect(
          container.querySelector("#current-bid-value")?.textContent
        ).toContain("15.00")
        expect(container.querySelector("#place-bid-error")).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })

    it("shows a connection problem when the socket never opens", async () => {
      vi.mocked(api.get).mockResolvedValue(publicLot())

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#auction-room-name")).not.toBeNull()
        })
      })

      vi.useFakeTimers()

      try {
        await act(async () => {
          latestSocket().dispatch("close", { code: 1006 })
          await vi.advanceTimersByTimeAsync(0)
        })

        expect(
          container.querySelector("#auction-connection")?.textContent
        ).toBe("The live connection failed. Trying again.")
        expect(container.querySelector("#auction-room-name")?.textContent).toBe(
          "Room Dragon"
        )
        expect(container.querySelector("#place-bid-error")).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe("when the countdown reaches a deadline", () => {
    it("counts the remaining live time and reads the lot again at the end", async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-10-27T14:59:58.000Z"))

      try {
        const room = publicLot({
          endsAt: new Date("2026-10-27T15:00:00.000Z"),
        })
        vi.mocked(api.get).mockResolvedValue({
          ...room,
          serverNow: new Date("2026-10-27T14:59:58.000Z"),
        })

        await renderRoom(lotId)

        await act(async () => {
          await vi.advanceTimersByTimeAsync(0)
          await vi.waitFor(() => {
            expect(
              container.querySelector("#auction-countdown")?.textContent
            ).toBe("Ends in 00:02")
          })
        })

        expect(vi.mocked(api.get)).toHaveBeenCalledTimes(1)

        await act(async () => {
          await vi.advanceTimersByTimeAsync(2000)
        })

        expect(container.querySelector("#auction-countdown")?.textContent).toBe(
          "Ends in 00:00"
        )
        expect(vi.mocked(api.get).mock.calls.length).toBeGreaterThan(1)
      } finally {
        vi.useRealTimers()
      }
    })

    it("counts until the start while bidding stays closed", async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-10-27T12:58:55.000Z"))

      try {
        vi.mocked(api.get).mockResolvedValue({
          ...publicLot({
            status: "SCHEDULED",
            currentBid: null,
            leaderParticipantNo: null,
            bidCount: 0,
            bids: [],
            startsAt: new Date("2026-10-27T13:00:00.000Z"),
          }),
          serverNow: new Date("2026-10-27T12:58:55.000Z"),
        })

        await renderRoom(lotId)

        await act(async () => {
          await vi.advanceTimersByTimeAsync(0)
        })

        expect(container.querySelector("#auction-countdown")?.textContent).toBe(
          "Starts in 01:05"
        )
        expect(container.querySelector("#place-bid")).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe("when the lot has finished", () => {
    it("shows that settlement is still writing the result", async () => {
      vi.mocked(api.get).mockResolvedValue(
        publicLot({
          status: "ENDED",
          sold: false,
          winnerParticipantNo: null,
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-settling")?.textContent).toBe(
            "The result is still being recorded."
          )
        })
      })

      expect(container.querySelector("#lot-winner")).toBeNull()
      expect(container.querySelector("#auction-countdown")).toBeNull()
      expect(container.querySelector("#auction-bid-2")).not.toBeNull()
      expect(container.querySelector("#place-bid")).toBeNull()
    })

    it("shows that an ended lot had no bids", async () => {
      vi.mocked(api.get).mockResolvedValue(
        publicLot({
          status: "ENDED",
          currentBid: null,
          leaderParticipantNo: null,
          bidCount: 0,
          bids: [],
          sold: false,
          winnerParticipantNo: null,
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-ended-empty")?.textContent).toBe(
            "This lot ended with no bids."
          )
        })
      })

      expect(container.querySelector("#lot-winner")).toBeNull()
      expect(container.querySelector("#lot-settling")).toBeNull()
    })

    it("keeps the history of a canceled lot and does not show a winner", async () => {
      vi.mocked(api.get).mockResolvedValue(
        publicLot({
          status: "CANCELED",
          sold: false,
          winnerParticipantNo: null,
        })
      )

      await renderRoom(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#auction-room-status")?.textContent
          ).toBe("Canceled")
        })
      })

      expect(container.querySelector("#auction-bid-1")).not.toBeNull()
      expect(container.querySelector("#lot-winner")).toBeNull()
      expect(container.querySelector("#lot-settling")).toBeNull()
      expect(container.querySelector("#place-bid")).toBeNull()
    })
  })
})
