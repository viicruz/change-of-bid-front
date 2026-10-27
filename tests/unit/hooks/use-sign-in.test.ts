// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useSignIn } from "@/src/hooks/auth/use-sign-in"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

vi.mock("@/src/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}))

const createdAt = new Date("2026-10-26T21:17:38.860Z")
const updatedAt = new Date("2026-10-26T21:17:38.860Z")

const signedInUser = {
  id: "OWYirXFpC4l38XONIWLZMTSqNDLxOaUk",
  name: "Auctioneer",
  email: "auctioneer@auctioneer.auctioneer",
  emailVerified: true,
  image: null,
  createdAt,
  updatedAt,
  role: "AUCTIONEER",
}

function SignInHarness() {
  const signIn = useSignIn()

  return createElement(
    "button",
    {
      id: "sign-in-submit",
      type: "button",
      onClick: () => {
        void signIn
          .mutateAsync({
            email: "auctioneer@auctioneer.auctioneer",
            password: "correct-horse-1",
          })
          .catch(() => undefined)
      },
    },
    signIn.isError ? "rejected" : (signIn.data?.user.role ?? "idle")
  )
}

describe("useSignIn", () => {
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
    vi.clearAllMocks()
  })

  function renderHarness() {
    act(() => {
      root.render(
        createElement(QueryProvider, null, createElement(SignInHarness))
      )
    })
  }

  async function submit() {
    const button = container.querySelector("button")

    await act(async () => {
      button?.click()
    })
  }

  it("returns the auctioneer role when sign-in succeeds", async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: {
        redirect: false,
        token: "MP6JhOkeD9d8BmmnP4NP9IKca8zprZld",
        user: signedInUser,
      },
      error: null,
    })

    renderHarness()
    await submit()

    await vi.waitFor(() => {
      expect(container.textContent).toBe("AUCTIONEER")
    })
  })

  it("rejects the sign-in when the user role is missing", async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: {
        redirect: false,
        token: "MP6JhOkeD9d8BmmnP4NP9IKca8zprZld",
        user: {
          ...signedInUser,
          role: undefined,
        },
      },
      error: null,
    })

    renderHarness()
    await submit()

    await vi.waitFor(() => {
      expect(container.textContent).toBe("rejected")
    })
  })
})
