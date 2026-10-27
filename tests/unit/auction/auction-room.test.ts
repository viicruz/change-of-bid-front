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
    createElement(QueryProvider, {
      children: createElement(AuctionRoom, { id: props.id }),
    })
  )
}

describe("AuctionRoom", () => {
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
        "button"
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
})
