// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { LotSection } from "@/src/components/home/lot-section"
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import type { IndexLot } from "@/src/hooks/lots/queries/use-index-lots"

//* Message imports
import enMessages from "@/messages/en.json"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

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

const liveLot: IndexLot = {
  id: "6f0b5c3e-7a1d-4e2b-9c8f-1a2b3c4d5e6f",
  title: "Blue-Eyes White Dragon",
  description: null,
  openingBid: "10.00",
  minIncrement: "1.00",
  startsAt: new Date("2026-10-20T18:00:00.000Z"),
  endsAt: new Date("2026-10-28T21:00:00.000Z"),
  items: [],
  status: "LIVE",
  currentBid: "1500.00",
  bidCount: 3,
  sold: false,
}

const endedLot: IndexLot = {
  ...liveLot,
  id: "7a1c6d4f-8b2e-4f3c-ad90-2b3c4d5e6f70",
  title: "Dark Magician",
  status: "ENDED",
  currentBid: "20.00",
  endsAt: new Date("2026-10-24T18:00:00.000Z"),
}

function SectionHarness(props: { query: string; status: PublicLotStatus }) {
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
      createElement(LotSection, {
        query: props.query,
        status: props.status,
      })
    )
  )
}

describe("LotSection", () => {
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

  it("requests lots for the section status and search and shows the lot title", async () => {
    vi.mocked(api.get).mockResolvedValue({ lots: [liveLot] })

    act(() => {
      root.render(
        createElement(SectionHarness, { query: "dragon", status: "LIVE" })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Blue-Eyes White Dragon")
      })
    })

    expect(api.get).toHaveBeenCalledWith({
      url: "/public/lots",
      params: {
        q: "dragon",
        status: "LIVE",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })

  it("links each lot to its auction page in the same tab", async () => {
    vi.mocked(api.get).mockResolvedValue({ lots: [liveLot] })

    act(() => {
      root.render(createElement(SectionHarness, { query: "", status: "LIVE" }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Blue-Eyes White Dragon")
      })
    })

    const link = container.querySelector(`#lot-link-${liveLot.id}`)

    expect(link).toBeInstanceOf(HTMLAnchorElement)
    expect(link?.getAttribute("href")).toBe(`/auction/${liveLot.id}`)
    expect(link?.getAttribute("target")).toBeNull()
    expect(container.querySelector(`#lot-audit-link-${liveLot.id}`)).toBeNull()
  })

  it("links an ended lot to its audit page", async () => {
    vi.mocked(api.get).mockResolvedValue({ lots: [endedLot] })

    act(() => {
      root.render(createElement(SectionHarness, { query: "", status: "ENDED" }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Dark Magician")
      })
    })

    const link = container.querySelector(`#lot-audit-link-${endedLot.id}`)

    expect(link).toBeInstanceOf(HTMLAnchorElement)
    expect(link?.getAttribute("href")).toBe(`/auction/${endedLot.id}/audit`)
    expect(link?.getAttribute("target")).toBeNull()
    expect(link?.textContent).toContain("Audit")
    expect(link?.querySelector("svg")).not.toBeNull()
  })

  it("shows an empty message when the section has no lots", async () => {
    vi.mocked(api.get).mockResolvedValue({ lots: [] })

    act(() => {
      root.render(
        createElement(SectionHarness, { query: "", status: "SCHEDULED" })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("No lots found.")
      })
    })

    expect(api.get).toHaveBeenCalledWith({
      url: "/public/lots",
      params: {
        status: "SCHEDULED",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })

  function numberedLots(count: number) {
    return Array.from({ length: count }, (_, index) => {
      const number = index + 1

      return {
        ...liveLot,
        id: `11111111-1111-4111-8111-${String(number).padStart(12, "0")}`,
        title: `Lot ${number}`,
      }
    })
  }

  function titlesInOrder() {
    return [...container.querySelectorAll("#lot-section-LIVE-list h3 a")].map(
      (link) => link.textContent
    )
  }

  function clickButton(id: string) {
    act(() => {
      container
        .querySelector<HTMLButtonElement>(`#${id}`)
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
  }

  async function renderLots(lots: IndexLot[], query = "") {
    vi.mocked(api.get).mockResolvedValue({ lots })

    act(() => {
      root.render(createElement(SectionHarness, { query, status: "LIVE" }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain(
          lots[0]?.title ?? "No lots found."
        )
      })
    })
  }

  describe("pagination", () => {
    it("hides pagination when every lot fits on the first page", async () => {
      await renderLots(numberedLots(8))

      expect(container.querySelector("#lot-section-LIVE-pagination")).toBeNull()
      expect(titlesInOrder()).toEqual([
        "Lot 1",
        "Lot 2",
        "Lot 3",
        "Lot 4",
        "Lot 5",
        "Lot 6",
        "Lot 7",
        "Lot 8",
      ])
    })

    it("shows the first page of eight lots and moves to the next page", async () => {
      await renderLots(numberedLots(9))

      expect(titlesInOrder()).toEqual([
        "Lot 1",
        "Lot 2",
        "Lot 3",
        "Lot 4",
        "Lot 5",
        "Lot 6",
        "Lot 7",
        "Lot 8",
      ])
      expect(
        container
          .querySelector("#lot-section-LIVE-page-1")
          ?.getAttribute("aria-current")
      ).toBe("page")
      expect(
        container.querySelector<HTMLButtonElement>("#lot-section-LIVE-previous")
          ?.disabled
      ).toBe(true)

      clickButton("lot-section-LIVE-next")

      expect(titlesInOrder()).toEqual(["Lot 9"])
      expect(
        container
          .querySelector("#lot-section-LIVE-page-2")
          ?.getAttribute("aria-current")
      ).toBe("page")
      expect(
        container.querySelector<HTMLButtonElement>("#lot-section-LIVE-next")
          ?.disabled
      ).toBe(true)
    })

    it("opens the page selected from the page links", async () => {
      await renderLots(numberedLots(9))

      clickButton("lot-section-LIVE-page-2")

      expect(titlesInOrder()).toEqual(["Lot 9"])
      expect(
        container
          .querySelector("#lot-section-LIVE-page-2")
          ?.getAttribute("aria-current")
      ).toBe("page")
    })

    it("returns to the first page when the search changes", async () => {
      await renderLots(numberedLots(9))

      clickButton("lot-section-LIVE-next")
      expect(titlesInOrder()).toEqual(["Lot 9"])

      act(() => {
        root.render(
          createElement(SectionHarness, { query: "lot", status: "LIVE" })
        )
      })

      await act(async () => {
        await vi.waitFor(() => {
          expect(titlesInOrder()).toEqual([
            "Lot 1",
            "Lot 2",
            "Lot 3",
            "Lot 4",
            "Lot 5",
            "Lot 6",
            "Lot 7",
            "Lot 8",
          ])
        })
      })

      expect(api.get).toHaveBeenCalledWith({
        url: "/public/lots",
        params: {
          q: "lot",
          status: "LIVE",
        },
        schema: expect.anything(),
        errorSchema: expect.anything(),
      })
      expect(
        container
          .querySelector("#lot-section-LIVE-page-1")
          ?.getAttribute("aria-current")
      ).toBe("page")
    })

    it("collapses distant pages and opens the selected page", async () => {
      await renderLots(numberedLots(41))

      expect(
        container.querySelector("#lot-section-LIVE-page-1")
      ).toBeInstanceOf(HTMLButtonElement)
      expect(
        container.querySelector("#lot-section-LIVE-page-2")
      ).toBeInstanceOf(HTMLButtonElement)
      expect(
        container.querySelector("#lot-section-LIVE-page-6")
      ).toBeInstanceOf(HTMLButtonElement)
      expect(container.querySelector("#lot-section-LIVE-page-3")).toBeNull()
      expect(
        container.querySelector("[data-slot='pagination-ellipsis']")
      ).not.toBeNull()

      clickButton("lot-section-LIVE-page-6")

      expect(titlesInOrder()).toEqual(["Lot 41"])
      expect(
        container
          .querySelector("#lot-section-LIVE-page-6")
          ?.getAttribute("aria-current")
      ).toBe("page")
    })

    it("scrolls the section back to the top when the page changes", async () => {
      await renderLots(numberedLots(9))
      const section = container.querySelector("#live")

      expect(section).toBeInstanceOf(HTMLElement)

      const scrollIntoView = vi.spyOn(section as HTMLElement, "scrollIntoView")

      clickButton("lot-section-LIVE-next")

      expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" })
    })

    it("keeps the scroll position when the search changes", async () => {
      await renderLots(numberedLots(9))
      const section = container.querySelector("#live") as HTMLElement
      const scrollIntoView = vi.spyOn(section, "scrollIntoView")

      clickButton("lot-section-LIVE-next")
      scrollIntoView.mockClear()

      act(() => {
        root.render(
          createElement(SectionHarness, { query: "lot", status: "LIVE" })
        )
      })

      await act(async () => {
        await vi.waitFor(() => {
          expect(titlesInOrder()[0]).toBe("Lot 1")
        })
      })

      expect(scrollIntoView).not.toHaveBeenCalled()
    })

    it("gives every pagination button an id and a button type", async () => {
      await renderLots(numberedLots(9))

      for (const id of [
        "lot-section-LIVE-previous",
        "lot-section-LIVE-next",
        "lot-section-LIVE-page-1",
        "lot-section-LIVE-page-2",
      ]) {
        const button = container.querySelector(`#${id}`)

        expect(button).toBeInstanceOf(HTMLButtonElement)
        expect(button?.getAttribute("type")).toBe("button")
      }
    })
  })

  it("shows an error when the section request fails", async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError(422, "Invalid", { message: "Invalid" })
    )

    act(() => {
      root.render(
        createElement(SectionHarness, { query: "dragon", status: "ENDED" })
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Could not load lots.")
      })
    })
  })
})
