// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { Navbar } from "@/src/components/navbar/navbar"
import { QueryProvider } from "@/src/components/query-provider"

//* Message imports
import enMessages from "@/messages/en.json"

const authSession = vi.hoisted(() => ({
  data: null as { user: { role: string } } | null,
  isPending: false,
  isRefetching: false,
  error: null,
  refetch: vi.fn(),
}))

const navigation = vi.hoisted(() => ({
  pathname: "/",
}))

vi.mock("@/src/hooks/auth/use-auth-session", () => ({
  useAuthSession: () => authSession,
}))

vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation")

  return {
    ...actual,
    usePathname: () => navigation.pathname,
    useRouter: () => ({
      refresh: vi.fn(),
    }),
  }
})

function renderNavbar() {
  return createElement(
    QueryProvider,
    null,
    createElement(
      NextIntlClientProvider,
      {
        locale: "en",
        messages: enMessages,
      } as ComponentProps<typeof NextIntlClientProvider>,
      createElement(Navbar)
    )
  )
}

function linkById(container: HTMLElement, id: string) {
  return container.querySelector(`#${id}`)
}

describe("Navbar", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    authSession.data = null
    authSession.isPending = false
    navigation.pathname = "/"
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
    it("shows sign in and create account", () => {
      act(() => {
        root.render(renderNavbar())
      })

      expect(
        linkById(container, "navbar-link-sign-in")?.getAttribute("href")
      ).toBe("/sign-in")
      expect(
        linkById(container, "navbar-link-sign-up")?.getAttribute("href")
      ).toBe("/sign-up")
      expect(linkById(container, "navbar-link-home")).toBeNull()
      expect(linkById(container, "navbar-link-my-bids")).toBeNull()
      expect(linkById(container, "navbar-link-wallet")).toBeNull()
      expect(linkById(container, "navbar-link-auctioneer")).toBeNull()
      expect(linkById(container, "navbar-brand")?.getAttribute("href")).toBe(
        "/"
      )
      expect(linkById(container, "navbar-sign-out")).toBeNull()
      expect(linkById(container, "navbar-menu-sign-out")).toBeNull()
    })
  })

  describe("when the user is a bidder", () => {
    it("shows lots, my bids, and wallet", () => {
      authSession.data = { user: { role: "BIDDER" } }

      act(() => {
        root.render(renderNavbar())
      })

      expect(
        linkById(container, "navbar-link-home")?.getAttribute("href")
      ).toBe("/")
      expect(
        linkById(container, "navbar-link-my-bids")?.getAttribute("href")
      ).toBe("/my-bids")
      expect(
        linkById(container, "navbar-link-wallet")?.getAttribute("href")
      ).toBe("/wallet")
      expect(linkById(container, "navbar-link-sign-in")).toBeNull()
      expect(linkById(container, "navbar-link-auctioneer")).toBeNull()
      expect(linkById(container, "navbar-sign-out")?.textContent).toBe(
        "Sign out"
      )
    })
  })

  describe("when the user is an auctioneer", () => {
    it("shows lots, the auctioneer panel, and wallet", () => {
      authSession.data = { user: { role: "AUCTIONEER" } }

      act(() => {
        root.render(renderNavbar())
      })

      expect(
        linkById(container, "navbar-link-home")?.getAttribute("href")
      ).toBe("/")
      expect(
        linkById(container, "navbar-link-auctioneer")?.getAttribute("href")
      ).toBe("/auctioneer")
      expect(
        linkById(container, "navbar-link-wallet")?.getAttribute("href")
      ).toBe("/wallet")
      expect(linkById(container, "navbar-link-my-bids")).toBeNull()
      expect(linkById(container, "navbar-link-sign-in")).toBeNull()
      expect(linkById(container, "navbar-sign-out")?.textContent).toBe(
        "Sign out"
      )
    })
  })

  describe("when a route is current", () => {
    it("marks the matching link and nested paths of that route", () => {
      authSession.data = { user: { role: "BIDDER" } }
      navigation.pathname = "/my-bids"

      act(() => {
        root.render(renderNavbar())
      })

      expect(
        linkById(container, "navbar-link-my-bids")?.getAttribute("aria-current")
      ).toBe("page")
      expect(
        linkById(container, "navbar-link-home")?.getAttribute("aria-current")
      ).toBeNull()

      navigation.pathname = "/my-bids/history"

      act(() => {
        root.render(renderNavbar())
      })

      expect(
        linkById(container, "navbar-link-my-bids")?.getAttribute("aria-current")
      ).toBe("page")
      expect(
        linkById(container, "navbar-link-wallet")?.getAttribute("aria-current")
      ).toBeNull()
    })
  })

  describe("when the session is loading", () => {
    it("hides role links", () => {
      authSession.isPending = true
      authSession.data = { user: { role: "BIDDER" } }

      act(() => {
        root.render(renderNavbar())
      })

      expect(linkById(container, "navbar-link-home")).toBeNull()
      expect(linkById(container, "navbar-link-sign-in")).toBeNull()
      expect(linkById(container, "navbar-link-my-bids")).toBeNull()
      expect(linkById(container, "navbar-menu")).toBeNull()
      expect(linkById(container, "navbar-sign-out")).toBeNull()
      expect(linkById(container, "navbar-menu-sign-out")).toBeNull()
      expect(linkById(container, "navbar-brand")).toBeInstanceOf(
        HTMLAnchorElement
      )
    })
  })
})
