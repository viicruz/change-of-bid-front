// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { LotShowcase } from "@/src/components/home/lot-showcase"
import { QueryProvider } from "@/src/components/query-provider"

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

function ShowcaseHarness() {
  return createElement(NextIntlClientProvider, {
    locale: "en",
    messages: enMessages,
    timeZone: "UTC",
    children: createElement(NuqsTestingAdapter, {
      hasMemory: true,
      children: createElement(QueryProvider, {
        children: createElement(LotShowcase),
      }),
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

function clickButton(container: ParentNode, id: string) {
  act(() => {
    container
      .querySelector<HTMLButtonElement>(`#${id}`)
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

describe("LotShowcase", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    vi.mocked(api.get).mockResolvedValue({ lots: [] })
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

  async function renderShowcase() {
    act(() => {
      root.render(createElement(ShowcaseHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(3)
      })
    })
  }

  it("shows every status section when no filter is active", async () => {
    await renderShowcase()

    expect(container.querySelector("#live")).not.toBeNull()
    expect(container.querySelector("#scheduled")).not.toBeNull()
    expect(container.querySelector("#ended")).not.toBeNull()
    expect(
      container.querySelector("#lot-filter-LIVE")?.getAttribute("aria-pressed")
    ).toBe("false")
    expect(api.get).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/public/lots",
        params: { status: "LIVE" },
      })
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/public/lots",
        params: { status: "SCHEDULED" },
      })
    )
    expect(api.get).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/public/lots",
        params: { status: "ENDED" },
      })
    )
  })

  it("keeps only the selected status and turns that filter off again", async () => {
    await renderShowcase()

    clickButton(container, "lot-filter-LIVE")

    expect(
      container.querySelector("#lot-filter-LIVE")?.getAttribute("aria-pressed")
    ).toBe("true")
    expect(
      container
        .querySelector("#lot-filter-SCHEDULED")
        ?.getAttribute("aria-pressed")
    ).toBe("false")
    expect(container.querySelector("#live")).not.toBeNull()
    expect(container.querySelector("#scheduled")).toBeNull()
    expect(container.querySelector("#ended")).toBeNull()

    clickButton(container, "lot-filter-LIVE")

    expect(
      container.querySelector("#lot-filter-LIVE")?.getAttribute("aria-pressed")
    ).toBe("false")
    expect(container.querySelector("#live")).not.toBeNull()
    expect(container.querySelector("#scheduled")).not.toBeNull()
    expect(container.querySelector("#ended")).not.toBeNull()
  })

  it("replaces the active filter when another status is selected", async () => {
    await renderShowcase()

    clickButton(container, "lot-filter-LIVE")
    clickButton(container, "lot-filter-ENDED")

    expect(
      container.querySelector("#lot-filter-LIVE")?.getAttribute("aria-pressed")
    ).toBe("false")
    expect(
      container.querySelector("#lot-filter-ENDED")?.getAttribute("aria-pressed")
    ).toBe("true")
    expect(container.querySelector("#ended")).not.toBeNull()
    expect(container.querySelector("#live")).toBeNull()
    expect(container.querySelector("#scheduled")).toBeNull()
  })

  it("sends the search text together with the active status filter", async () => {
    await renderShowcase()

    clickButton(container, "lot-filter-SCHEDULED")
    vi.mocked(api.get).mockClear()

    const input = container.querySelector<HTMLInputElement>("#lot-search")

    expect(input).toBeInstanceOf(HTMLInputElement)

    act(() => {
      setInputValue(input as HTMLInputElement, "dragon")
    })

    await vi.waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/public/lots",
          params: {
            q: "dragon",
            status: "SCHEDULED",
          },
        })
      )
    })

    expect(container.querySelector("#scheduled")).not.toBeNull()
    expect(container.querySelector("#live")).toBeNull()
    expect(container.querySelector("#ended")).toBeNull()
  })
})
