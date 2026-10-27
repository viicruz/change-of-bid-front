// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { BidHistory } from "@/src/components/bids/bid-history"
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import type { IndexParticipation } from "@/src/hooks/participations/queries/use-index-participations"

//* Message imports
import enMessages from "@/messages/en.json"

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

const lotItem = {
  id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
  position: 1,
  cardId: 89631139,
  quantity: 1,
  cardName: "Blue-Eyes White Dragon",
  imagePath: "https://images.example/card.jpg",
}

function participation(
  overrides: Partial<IndexParticipation> &
    Pick<IndexParticipation, "id" | "title" | "status">
): IndexParticipation {
  return {
    description: null,
    openingBid: "10.00",
    minIncrement: "1.00",
    startsAt: new Date("2026-10-26T15:00:00.000Z"),
    endsAt: new Date("2026-10-26T17:00:00.000Z"),
    items: [lotItem],
    currentBid: "12.50",
    bidCount: 2,
    participantNo: 1,
    won: false,
    ...overrides,
  }
}

const liveParticipation = participation({
  id: "6d8f0c3e-1b2a-4c5d-9e0f-123456789abc",
  title: "Blue-Eyes",
  status: "LIVE",
  currentBid: "12.50",
  endsAt: new Date("2026-10-26T17:00:00.000Z"),
})

const scheduledParticipation = participation({
  id: "7e6d1d4f-3c2b-401f-8d3b-2b3c4d5e6f70",
  title: "Scheduled lot",
  status: "SCHEDULED",
  currentBid: null,
  startsAt: new Date("2026-10-28T15:00:00.000Z"),
})

const endedParticipation = participation({
  id: "8f7e2e50-4d3c-4120-9e4c-3c4d5e6f7081",
  title: "Dark Magician",
  status: "ENDED",
  currentBid: "20.00",
  endsAt: new Date("2026-10-24T18:00:00.000Z"),
  won: true,
})

const canceledParticipation = participation({
  id: "90a13f61-5e4d-4231-af5d-4d5e6f708192",
  title: "Mirror Force",
  status: "CANCELED",
  currentBid: "8.00",
  endsAt: new Date("2026-10-22T16:00:00.000Z"),
})

const participations = [
  liveParticipation,
  scheduledParticipation,
  endedParticipation,
  canceledParticipation,
]

function HistoryHarness() {
  return createElement(NextIntlClientProvider, {
    locale: "en",
    messages: enMessages,
    timeZone: "UTC",
    children: createElement(QueryProvider, {
      children: createElement(BidHistory),
    }),
  })
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value)
}

describe("BidHistory", () => {
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

  async function renderParticipations() {
    vi.mocked(api.get).mockResolvedValue({ lots: participations })

    act(() => {
      root.render(createElement(HistoryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Blue-Eyes")
      })
    })
  }

  function titlesInOrder() {
    return [...container.querySelectorAll("#bid-history > li")].map((item) => {
      return item.querySelector("[data-slot=card-title]")?.textContent
    })
  }

  function clickFilter(filter: string) {
    act(() => {
      container
        .querySelector<HTMLButtonElement>(`#bid-filter-${filter}`)
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
  }

  it("lists participations in the order returned by the api", async () => {
    await renderParticipations()

    expect(titlesInOrder()).toEqual([
      "Blue-Eyes",
      "Scheduled lot",
      "Dark Magician",
      "Mirror Force",
    ])
    expect(api.get).toHaveBeenCalledWith({
      url: "/private/participations",
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })

  it("shows a loading message while participations are loading", () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

    act(() => {
      root.render(createElement(HistoryHarness))
    })

    expect(container.textContent).toContain("Loading bids.")
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull()
  })

  it("shows an error when participations fail to load", async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError(422, "Invalid", { message: "Invalid" })
    )

    act(() => {
      root.render(createElement(HistoryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Could not load your bids.")
      })
    })

    expect(container.querySelector("#bid-history")).toBeNull()
  })

  it("shows an empty message when the bidder has no participations", async () => {
    vi.mocked(api.get).mockResolvedValue({ lots: [] })

    act(() => {
      root.render(createElement(HistoryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain(
          "You have not bid on any lots yet."
        )
      })
    })
  })

  describe("search", () => {
    it("filters participations by lot title without changing their order", async () => {
      await renderParticipations()

      const search = container.querySelector("#bid-search")

      expect(search).toBeInstanceOf(HTMLInputElement)

      act(() => {
        setInputValue(search as HTMLInputElement, "  lot ")
      })

      expect(titlesInOrder()).toEqual(["Scheduled lot"])
    })

    it("shows an empty message when the search matches nothing", async () => {
      await renderParticipations()

      act(() => {
        setInputValue(
          container.querySelector("#bid-search") as HTMLInputElement,
          "pot of greed"
        )
      })

      expect(
        container.querySelector("#bid-history-empty-filtered")?.textContent
      ).toBe("No matching bids.")
      expect(container.querySelector("#bid-history")).toBeNull()
    })
  })

  describe("filters", () => {
    it("shows only scheduled participations and hides the bid amount", async () => {
      await renderParticipations()

      clickFilter("SCHEDULED")

      expect(titlesInOrder()).toEqual(["Scheduled lot"])
      expect(
        container.querySelector(`#bid-amount-${scheduledParticipation.id}`)
      ).toBeNull()
      expect(
        container.querySelector(`#bid-schedule-${scheduledParticipation.id}`)
          ?.textContent
      ).toContain("Starts at")
      expect(
        container.querySelector(`#bid-schedule-${scheduledParticipation.id}`)
          ?.textContent
      ).toContain(formatDate(scheduledParticipation.startsAt))
      expect(
        container
          .querySelector(`#bid-filter-SCHEDULED`)
          ?.getAttribute("aria-pressed")
      ).toBe("true")
    })

    it("shows the current bid and end date for a live participation", async () => {
      await renderParticipations()

      clickFilter("LIVE")

      expect(titlesInOrder()).toEqual(["Blue-Eyes"])
      expect(
        container.querySelector(`#bid-amount-${liveParticipation.id}`)
          ?.textContent
      ).toContain("Current bid")
      expect(
        container.querySelector(`#bid-amount-${liveParticipation.id}`)
          ?.textContent
      ).toContain("12.50")
      expect(
        container.querySelector(`#bid-schedule-${liveParticipation.id}`)
          ?.textContent
      ).toContain("Ends at")
      expect(
        container.querySelector(`#bid-won-${liveParticipation.id}`)
      ).toBeNull()
    })

    it("shows the final bid, ended date, and won label for a won participation", async () => {
      await renderParticipations()

      clickFilter("ENDED")

      expect(titlesInOrder()).toEqual(["Dark Magician"])
      expect(
        container.querySelector(`#bid-amount-${endedParticipation.id}`)
          ?.textContent
      ).toContain("Final bid")
      expect(
        container.querySelector(`#bid-amount-${endedParticipation.id}`)
          ?.textContent
      ).toContain("20.00")
      expect(
        container.querySelector(`#bid-schedule-${endedParticipation.id}`)
          ?.textContent
      ).toContain("Ended at")
      expect(
        container.querySelector(`#bid-schedule-${endedParticipation.id}`)
          ?.textContent
      ).toContain(formatDate(endedParticipation.endsAt))
      expect(
        container.querySelector(`#bid-won-${endedParticipation.id}`)
          ?.textContent
      ).toBe("Won")
    })

    it("shows the current bid and end date for a canceled participation", async () => {
      await renderParticipations()

      clickFilter("CANCELED")

      expect(titlesInOrder()).toEqual(["Mirror Force"])
      expect(
        container.querySelector(`#bid-status-${canceledParticipation.id}`)
          ?.textContent
      ).toBe("Canceled")
      expect(
        container.querySelector(`#bid-amount-${canceledParticipation.id}`)
          ?.textContent
      ).toContain("Current bid")
      expect(
        container.querySelector(`#bid-amount-${canceledParticipation.id}`)
          ?.textContent
      ).toContain("8.00")
      expect(
        container.querySelector(`#bid-schedule-${canceledParticipation.id}`)
          ?.textContent
      ).toContain("Ends at")
      expect(
        container.querySelector(`#bid-won-${canceledParticipation.id}`)
      ).toBeNull()
    })

    it("shows only participations the bidder won", async () => {
      await renderParticipations()

      clickFilter("won")

      expect(titlesInOrder()).toEqual(["Dark Magician"])
      expect(
        container.querySelector(`#bid-filter-won`)?.getAttribute("aria-pressed")
      ).toBe("true")
      expect(
        container
          .querySelector(`#bid-filter-LIVE`)
          ?.getAttribute("aria-pressed")
      ).toBe("false")
    })

    it("clears the active filter when it is clicked again", async () => {
      await renderParticipations()

      clickFilter("LIVE")
      expect(titlesInOrder()).toEqual(["Blue-Eyes"])

      clickFilter("LIVE")

      expect(titlesInOrder()).toEqual([
        "Blue-Eyes",
        "Scheduled lot",
        "Dark Magician",
        "Mirror Force",
      ])
      expect(
        container
          .querySelector("#bid-filter-LIVE")
          ?.getAttribute("aria-pressed")
      ).toBe("false")
    })

    it("applies the search and the active filter together", async () => {
      await renderParticipations()

      clickFilter("ENDED")

      act(() => {
        setInputValue(
          container.querySelector("#bid-search") as HTMLInputElement,
          "mirror"
        )
      })

      expect(
        container.querySelector("#bid-history-empty-filtered")
      ).not.toBeNull()
      expect(container.querySelector("#bid-history")).toBeNull()
    })
  })

  it("links each participation to its auction page", async () => {
    await renderParticipations()

    const link = container.querySelector(
      `#bid-lot-link-${liveParticipation.id}`
    )

    expect(link).toBeInstanceOf(HTMLAnchorElement)
    expect(link?.getAttribute("href")).toBe(`/auction/${liveParticipation.id}`)
    expect(link?.getAttribute("target")).toBeNull()
  })

  it("gives every filter button an id and a button type", async () => {
    await renderParticipations()

    for (const filter of ["SCHEDULED", "LIVE", "ENDED", "CANCELED", "won"]) {
      const button = container.querySelector(`#bid-filter-${filter}`)

      expect(button).toBeInstanceOf(HTMLButtonElement)
      expect(button?.getAttribute("type")).toBe("button")
    }
  })
})
