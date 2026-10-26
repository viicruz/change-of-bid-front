// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useSignUp } from "@/src/hooks/auth/use-sign-up"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

vi.mock("@/src/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
  },
}))

const createdAt = new Date("2026-10-26T21:17:38.860Z")
const updatedAt = new Date("2026-10-26T21:17:38.860Z")

const signedUpUser = {
  id: "OWYirXFpC4l38XONIWLZMTSqNDLxOaUk",
  name: "Bidder",
  email: "bidder@bidder.bidder",
  emailVerified: true,
  image: null,
  createdAt,
  updatedAt,
  role: "BIDDER",
}

function SignUpHarness() {
  const signUp = useSignUp()

  return createElement(
    "button",
    {
      id: "sign-up-submit",
      type: "button",
      onClick: () => {
        void signUp
          .mutateAsync({
            name: "Bidder",
            email: "bidder@bidder.bidder",
            password: "correct-horse-1",
          })
          .catch(() => undefined)
      },
    },
    signUp.isError ? "rejected" : (signUp.data?.user.role ?? "idle")
  )
}

describe("useSignUp", () => {
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
        createElement(QueryProvider, null, createElement(SignUpHarness))
      )
    })
  }

  async function submit() {
    const button = container.querySelector("button")

    await act(async () => {
      button?.click()
    })
  }

  it("returns the bidder role when sign-up succeeds", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      data: {
        token: "session-token",
        user: signedUpUser,
      },
      error: null,
    })

    renderHarness()
    await submit()

    await vi.waitFor(() => {
      expect(container.textContent).toBe("BIDDER")
    })
  })

  it("rejects the sign-up when the user role is invalid", async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      data: {
        token: "session-token",
        user: {
          ...signedUpUser,
          role: "ADMIN",
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
