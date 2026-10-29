// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { RequireAuctioneer } from "@/src/components/auth/require-auctioneer"

const authSession = vi.hoisted(() => ({
  data: null as { user: { role: string } } | null,
  isPending: false,
  isRefetching: false,
  error: null,
  refetch: vi.fn(),
}))

const replace = vi.hoisted(() => vi.fn())

vi.mock("@/src/hooks/auth/use-auth-session", () => ({
  useAuthSession: () => authSession,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}))

function renderGuard(children: ReactNode) {
  return createElement(RequireAuctioneer, null, children)
}

describe("RequireAuctioneer", () => {
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

  describe("when the session is still loading", () => {
    it("hides the page and waits before redirecting", () => {
      authSession.isPending = true

      act(() => {
        root.render(
          renderGuard(createElement("h1", { id: "auctioneer-page" }, "Lots"))
        )
      })

      expect(container.querySelector("#auctioneer-page")).toBeNull()
      expect(replace).not.toHaveBeenCalled()
    })
  })

  describe("when the user is signed out", () => {
    it("redirects to the home page", () => {
      act(() => {
        root.render(
          renderGuard(createElement("h1", { id: "auctioneer-page" }, "Lots"))
        )
      })

      expect(container.querySelector("#auctioneer-page")).toBeNull()
      expect(replace).toHaveBeenCalledExactlyOnceWith("/")
    })
  })

  describe("when the user is a bidder", () => {
    it("redirects to the home page", () => {
      authSession.data = { user: { role: "BIDDER" } }

      act(() => {
        root.render(
          renderGuard(createElement("h1", { id: "auctioneer-page" }, "Lots"))
        )
      })

      expect(container.querySelector("#auctioneer-page")).toBeNull()
      expect(replace).toHaveBeenCalledExactlyOnceWith("/")
    })
  })

  describe("when the user is an auctioneer", () => {
    it("renders the page and stays there", () => {
      authSession.data = { user: { role: "AUCTIONEER" } }

      act(() => {
        root.render(
          renderGuard(createElement("h1", { id: "auctioneer-page" }, "Lots"))
        )
      })

      expect(container.querySelector("#auctioneer-page")?.textContent).toBe(
        "Lots"
      )
      expect(replace).not.toHaveBeenCalled()
    })
  })
})
