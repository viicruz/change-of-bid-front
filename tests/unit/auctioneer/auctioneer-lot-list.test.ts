// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { AuctioneerLotList } from "@/src/components/auctioneer/auctioneer-lot-list"
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import type { IndexPrivateLot } from "@/src/hooks/lots/queries/use-index-private-lots"

//* Message imports
import enMessages from "@/messages/en.json"

//* Schema imports
import type { PrivateLotStatus } from "@/src/schemas/lot"

//* Local imports
import { ApiError, api } from "@/src/lib/api"
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

function privateLot(
  overrides: Partial<IndexPrivateLot> &
    Pick<IndexPrivateLot, "id" | "title" | "status">
): IndexPrivateLot {
  return {
    description: null,
    openingBid: "10.00",
    minIncrement: "0.50",
    startsAt: new Date("2026-10-26T18:00:00.000Z"),
    endsAt: new Date("2026-10-27T18:00:00.000Z"),
    items: [],
    currentBid: "12.50",
    bidCount: 3,
    sold: false,
    receivedAmount: null,
    ...overrides,
  }
}

const liveLot = privateLot({
  id: "6f0b5c3e-7a1d-4e2b-9c8f-1a2b3c4d5e6f",
  title: "Dragon lot",
  status: "LIVE",
  currentBid: "12.50",
})

const endedLot = privateLot({
  id: "7a1d4e2b-9c8f-4e2b-8c8f-2b3c4d5e6f70",
  title: "Ended spell lot",
  status: "ENDED",
  currentBid: null,
})

function ListHarness(props: {
  query: string
  status?: PrivateLotStatus
  selectedLotId?: string | null
  newLotId?: string | null
  onSelectLot?: (lotId: string) => void
}) {
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
      createElement(AuctioneerLotList, {
        query: props.query,
        status: props.status,
        selectedLotId: props.selectedLotId ?? null,
        newLotId: props.newLotId ?? null,
        onSelectLot: props.onSelectLot ?? (() => undefined),
      })
    )
  )
}

describe("AuctioneerLotList", () => {
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

  it("requests the auctioneer lots with search and status and shows the lot title", async () => {
    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "150.00",
      lots: [liveLot],
    })

    act(() => {
      root.render(
        createElement(ListHarness, { query: "dragon", status: "LIVE" })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Dragon lot")
      })
    })

    expect(container.textContent).toContain("Current bid")
    expect(api.get).toHaveBeenCalledWith({
      url: "/private/lots",
      params: {
        q: "dragon",
        status: "LIVE",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })

  it("selects a lot in place when its button is clicked", async () => {
    const onSelectLot = vi.fn()

    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [liveLot],
    })

    act(() => {
      root.render(
        createElement(ListHarness, {
          query: "",
          status: "LIVE",
          onSelectLot,
        })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Dragon lot")
      })
    })

    const button = container.querySelector(`#auctioneer-lot-${liveLot.id}`)

    expect(button).toBeInstanceOf(HTMLButtonElement)
    expect(button?.getAttribute("type")).toBe("button")
    expect(container.querySelector("a")).toBeNull()

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(onSelectLot).toHaveBeenCalledWith(liveLot.id)
  })

  it("marks the selected lot as active", async () => {
    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [endedLot, liveLot],
    })

    act(() => {
      root.render(
        createElement(ListHarness, {
          query: "",
          selectedLotId: liveLot.id,
        })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Dragon lot")
      })
    })

    const selected = container.querySelector(`#auctioneer-lot-${liveLot.id}`)
    const other = container.querySelector(`#auctioneer-lot-${endedLot.id}`)

    expect(selected?.hasAttribute("data-active")).toBe(true)
    expect(other?.hasAttribute("data-active")).toBe(false)
  })

  it("shows an empty message when the auctioneer has no lots", async () => {
    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [],
    })

    act(() => {
      root.render(
        createElement(ListHarness, { query: "", status: "SCHEDULED" })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("No lots found.")
      })
    })

    expect(api.get).toHaveBeenCalledWith({
      url: "/private/lots",
      params: {
        status: "SCHEDULED",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })

  it("shows an error when the lots request fails", async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError(403, "Forbidden", {
        code: "NOT_AUCTIONEER",
        message: "Only an auctioneer can list their lots.",
      })
    )

    act(() => {
      root.render(
        createElement(ListHarness, { query: "dragon", status: "ENDED" })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Could not load lots.")
      })
    })
  })

  it("renders lots in the order returned by the API", async () => {
    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [endedLot, liveLot],
    })

    act(() => {
      root.render(createElement(ListHarness, { query: "" }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Ended spell lot")
      })
    })

    const buttons = [
      ...container.querySelectorAll("button[id^='auctioneer-lot-']"),
    ].map((button) => button.id)

    expect(buttons).toEqual([
      `auctioneer-lot-${endedLot.id}`,
      `auctioneer-lot-${liveLot.id}`,
    ])
    expect(container.textContent?.indexOf("No bids")).toBeLessThan(
      container.textContent?.indexOf("Current bid") ?? -1
    )
  })

  it("labels the value by what happened to the lot", async () => {
    const soldLot = privateLot({
      id: "8b2e5f3c-0d9a-4f3c-9d9a-3c4d5e6f7081",
      title: "Sold lot",
      status: "ENDED",
      currentBid: "30.00",
      sold: true,
    })
    const scheduledLot = privateLot({
      id: "9c3f6a4d-1eab-4a4d-8eab-4d5e6f708192",
      title: "Scheduled lot",
      status: "SCHEDULED",
      currentBid: null,
    })

    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [liveLot, soldLot, endedLot, scheduledLot],
    })

    act(() => {
      root.render(createElement(ListHarness, { query: "" }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Scheduled lot")
      })
    })

    function rowText(lotId: string) {
      return container.querySelector(`#auctioneer-lot-${lotId}`)?.textContent
    }

    expect(rowText(liveLot.id)).toContain("Current bid")
    expect(rowText(soldLot.id)).toContain("Sold for")
    expect(rowText(endedLot.id)).toContain("No bids")
    expect(rowText(scheduledLot.id)).toContain("Starting bid")
    expect(
      container.querySelector(`#auctioneer-lot-value-${endedLot.id}`)
        ?.textContent
    ).toBe("—")
    expect(
      container.querySelector(`#auctioneer-lot-status-${scheduledLot.id}`)
        ?.textContent
    ).toBe("Scheduled")
  })

  it("shows how many cards the lot has and when it ends", async () => {
    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [
        privateLot({
          ...liveLot,
          items: [
            {
              id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
              position: 1,
              cardId: 89631139,
              quantity: 2,
              cardName: "Blue-Eyes White Dragon",
              imagePath:
                "https://images.ygoprodeck.com/images/cards/89631139.jpg",
            },
            {
              id: "b2c3d4e5-f6a7-4901-bcde-f12345678901",
              position: 2,
              cardId: 46986414,
              quantity: 1,
              cardName: "Dark Magician",
              imagePath:
                "https://images.ygoprodeck.com/images/cards/46986414.jpg",
            },
          ],
        }),
      ],
    })

    act(() => {
      root.render(createElement(ListHarness, { query: "" }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Dragon lot")
      })
    })

    const row = container.querySelector(`#auctioneer-lot-${liveLot.id}`)

    expect(row?.textContent).toContain("3 cards · Ends")
    expect(row?.querySelector("img")?.getAttribute("src")).toContain(
      encodeURIComponent(
        "https://images.ygoprodeck.com/images/cards/89631139.jpg"
      )
    )
  })

  it("marks the lot just published as new", async () => {
    vi.mocked(api.get).mockResolvedValue({
      totalReceived: "0.00",
      lots: [endedLot, liveLot],
    })

    act(() => {
      root.render(
        createElement(ListHarness, { query: "", newLotId: liveLot.id })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Dragon lot")
      })
    })

    expect(
      container.querySelector(`#auctioneer-lot-new-${liveLot.id}`)?.textContent
    ).toBe("New")
    expect(
      container.querySelector(`#auctioneer-lot-new-${endedLot.id}`)
    ).toBeNull()
  })
})
