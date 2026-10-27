// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { AuctioneerLotList } from "@/src/components/auctioneer/auctioneer-lot-list"
import { QueryProvider } from "@/src/components/query-provider"
import Sidebar from "@/src/components/ui/sidebar"

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
      createElement(
        Sidebar.Provider,
        null,
        createElement(AuctioneerLotList, {
          query: props.query,
          status: props.status,
          selectedLotId: props.selectedLotId ?? null,
          onSelectLot: props.onSelectLot ?? (() => undefined),
        })
      )
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
    expect(container.textContent?.indexOf("Starting bid")).toBeLessThan(
      container.textContent?.indexOf("Current bid") ?? -1
    )
  })
})
