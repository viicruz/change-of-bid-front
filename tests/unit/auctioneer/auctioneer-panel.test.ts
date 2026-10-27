// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { AuctioneerPanel } from "@/src/components/auctioneer/auctioneer-panel"
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import type { IndexPrivateLot } from "@/src/hooks/lots/queries/use-index-private-lots"
import type { ShowPrivateLot } from "@/src/hooks/lots/queries/use-show-private-lot"

//* Message imports
import enMessages from "@/messages/en.json"

//* Local imports
import { api } from "@/src/lib/api"
import { queryClient } from "@/src/lib/query-client"

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

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) =>
    createElement("img", { alt: props.alt, src: props.src }),
}))

const lotId = "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f"

const listedLot: IndexPrivateLot = {
  id: lotId,
  title: "Listed dragon lot",
  description: null,
  openingBid: "10.00",
  minIncrement: "0.50",
  startsAt: new Date("2026-10-26T14:00:00.000Z"),
  endsAt: new Date("2026-10-26T16:00:00.000Z"),
  items: [],
  status: "LIVE",
  currentBid: "15.00",
  bidCount: 2,
  sold: false,
  receivedAmount: null,
}

const shownLot: ShowPrivateLot = {
  serverNow: new Date("2026-10-26T15:00:00.000Z"),
  lot: {
    id: lotId,
    title: "Blue-Eyes lot",
    description: null,
    openingBid: "10.00",
    minIncrement: "0.50",
    startsAt: new Date("2026-10-26T14:00:00.000Z"),
    endsAt: new Date("2026-10-26T16:00:00.000Z"),
    extensionCount: 0,
    status: "LIVE",
    currentBid: "15.00",
    leaderParticipantNo: 4,
    bidCount: 1,
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
          name: "Blue-Eyes White Dragon",
        },
      },
    ],
    bids: [
      {
        sequence: 1,
        amount: "15.00",
        createdAt: new Date("2026-10-26T14:20:00.000Z"),
        participantNo: 4,
      },
    ],
  },
}

function PanelHarness() {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
      timeZone: "UTC",
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(QueryProvider, null, createElement(AuctioneerPanel))
  )
}

describe("AuctioneerPanel", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
    vi.mocked(api.get).mockImplementation(async (options) => {
      if (options.url === `/private/lots/${lotId}`) {
        return shownLot
      }

      if (options.url === "/private/lots") {
        return {
          totalReceived: "0.00",
          lots: [listedLot],
        }
      }

      return {
        data: [],
      }
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    queryClient.clear()
    vi.clearAllMocks()
  })

  it("shows a created lot in place of the form and returns to the form from create lot", async () => {
    act(() => {
      root.render(createElement(PanelHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Listed dragon lot")
      })
    })

    expect(container.querySelector("#create-lot-form")).not.toBeNull()
    expect(container.querySelector("#card-search-panel")).not.toBeNull()

    act(() => {
      container
        .querySelector<HTMLButtonElement>(`#auctioneer-lot-${lotId}`)
        ?.click()
    })

    expect(container.querySelector("#create-lot-form")).toBeNull()
    expect(container.querySelector("#card-search-panel")).toBeNull()

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.querySelector("#private-lot-title")?.textContent).toBe(
          "Blue-Eyes lot"
        )
      })
    })

    expect(api.get).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/private/lots/${lotId}`,
      })
    )

    act(() => {
      container.querySelector<HTMLButtonElement>("#create-lot")?.click()
    })

    expect(container.querySelector("#private-lot-details")).toBeNull()
    expect(container.querySelector("#create-lot-form")).not.toBeNull()
    expect(container.querySelector("#card-search-panel")).not.toBeNull()
  })
})
