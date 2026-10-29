// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { HeroActions } from "@/src/components/home/hero-actions"

//* Message imports
import enMessages from "@/messages/en.json"

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

function renderHeroActions() {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(HeroActions)
  )
}

function linkById(container: HTMLElement, id: string) {
  return container.querySelector(`#${id}`)
}

describe("HeroActions", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    authSession.data = null
    authSession.isPending = false
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.clearAllMocks()
  })

  describe("when there is no session", () => {
    it("shows the live lots link and the free sign up link", () => {
      act(() => {
        root.render(renderHeroActions())
      })

      expect(linkById(container, "hero-live-link")?.getAttribute("href")).toBe(
        "#live"
      )
      expect(
        linkById(container, "hero-sign-up-link")?.getAttribute("href")
      ).toBe("/sign-up")
      expect(linkById(container, "hero-sign-up-link")?.textContent).toBe(
        "Sign up free"
      )
    })
  })

  describe("when the user is signed in", () => {
    it("hides the free sign up link", () => {
      authSession.data = { user: { role: "BIDDER" } }

      act(() => {
        root.render(renderHeroActions())
      })

      expect(linkById(container, "hero-live-link")).toBeInstanceOf(
        HTMLAnchorElement
      )
      expect(linkById(container, "hero-sign-up-link")).toBeNull()
    })
  })

  describe("when the session is loading", () => {
    it("hides the free sign up link until the session is known", () => {
      authSession.isPending = true

      act(() => {
        root.render(renderHeroActions())
      })

      expect(linkById(container, "hero-live-link")).toBeInstanceOf(
        HTMLAnchorElement
      )
      expect(linkById(container, "hero-sign-up-link")).toBeNull()
    })
  })
})
