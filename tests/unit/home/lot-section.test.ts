// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement } from "react"
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

function SectionHarness(props: { query: string; status: PublicLotStatus }) {
  return createElement(NextIntlClientProvider, {
    locale: "en",
    messages: enMessages,
    timeZone: "UTC",
    children: createElement(QueryProvider, {
      children: createElement(LotSection, {
        query: props.query,
        status: props.status,
      }),
    }),
  })
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
