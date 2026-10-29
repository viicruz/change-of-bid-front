// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { YugiohCard } from "@/src/components/cards/yugioh-card"

//* Message imports
import enMessages from "@/messages/en.json"

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) =>
    createElement("img", { alt: props.alt, src: props.src }),
}))

const yugiohDeckImageUrl =
  "https://images.ygoprodeck.com/images/cards/89631139.jpg"
const backendImageUrl = "http://localhost:3001/images/89631139.jpg"

function CardHarness(props: ComponentProps<typeof YugiohCard>) {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
      timeZone: "UTC",
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(YugiohCard, props)
  )
}

describe("YugiohCard", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  describe("image", () => {
    it("renders a YGOPRODeck image url unchanged", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            imageUrl: yugiohDeckImageUrl,
            size: "md",
            amount: 1,
            quantityId: "card-quantity",
          })
        )
      })

      expect(container.querySelector("img")?.getAttribute("src")).toBe(
        yugiohDeckImageUrl
      )
    })

    it("renders a backend image url unchanged", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            imageUrl: backendImageUrl,
            size: "md",
            amount: 1,
            quantityId: "card-quantity",
          })
        )
      })

      expect(container.querySelector("img")?.getAttribute("src")).toBe(
        backendImageUrl
      )
    })

    it("does not render an image when imageUrl is missing", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            size: "sm",
            amount: 1,
            quantityId: "card-quantity",
          })
        )
      })

      expect(container.querySelector("img")).toBeNull()
      expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
    })
  })

  describe("amount", () => {
    it("shows the copy count on the badge", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            imageUrl: yugiohDeckImageUrl,
            size: "md",
            amount: 3,
            quantityId: "card-quantity",
          })
        )
      })

      const badge = container.querySelector("#card-quantity")

      expect(badge?.textContent).toContain("Quantity")
      expect(badge?.textContent).toContain("×")
      expect(badge?.textContent).toContain("3")
    })

    it("hides the copy count when amount is omitted", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            imageUrl: yugiohDeckImageUrl,
            size: "sm",
          })
        )
      })

      expect(container.querySelector("#card-quantity")).toBeNull()
      expect(container.textContent).not.toContain("×")
      expect(container.textContent).not.toContain("Quantity")
    })
  })

  describe("size", () => {
    it("shows the name when the size is sm", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            imageUrl: yugiohDeckImageUrl,
            size: "sm",
            amount: 1,
            quantityId: "card-quantity",
          })
        )
      })

      const name = container.querySelector("p.line-clamp-2")

      expect(name?.textContent).toBe("Blue-Eyes White Dragon")
      expect(name?.className).not.toContain("sr-only")
    })

    it("keeps the name for screen readers only when the size is lg", () => {
      act(() => {
        root.render(
          createElement(CardHarness, {
            name: "Blue-Eyes White Dragon",
            imageUrl: yugiohDeckImageUrl,
            size: "lg",
            amount: 2,
            quantityId: "card-quantity",
          })
        )
      })

      const name = container.querySelector("p.sr-only")

      expect(name?.textContent).toBe("Blue-Eyes White Dragon")
      expect(container.querySelector("p.line-clamp-2")).toBeNull()
    })
  })
})
