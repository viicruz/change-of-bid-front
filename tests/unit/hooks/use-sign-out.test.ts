// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useSignOut } from "@/src/hooks/auth/use-sign-out"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

const tokenKey = "change-of-bid.bearer-token"
const signOutUrl = "http://localhost:3000/backend/api/auth/sign-out"

function SignOutHarness() {
  const signOut = useSignOut()

  return createElement(
    "button",
    {
      id: "sign-out-submit",
      type: "button",
      onClick: () => {
        void signOut.mutateAsync().catch(() => undefined)
      },
    },
    signOut.isError ? "rejected" : signOut.isSuccess ? "signed-out" : "idle"
  )
}

describe("useSignOut", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    sessionStorage.clear()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    sessionStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function renderHarness() {
    act(() => {
      root.render(
        createElement(QueryProvider, null, createElement(SignOutHarness))
      )
    })
  }

  async function submit() {
    const button = container.querySelector("button")

    await act(async () => {
      button?.click()
    })
  }

  function stubFetch(status: number) {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }))
    vi.stubGlobal("fetch", fetchMock)

    return fetchMock
  }

  function requestInit() {
    const fetchMock = vi.mocked(fetch)
    const call = fetchMock.mock.calls[0] as [string, RequestInit]

    return call
  }

  it("posts an empty json object and sends the bearer token", async () => {
    sessionStorage.setItem(tokenKey, "session-token")
    const signalBefore = authClient.$store.atoms.$sessionSignal.get()
    stubFetch(204)

    renderHarness()
    await submit()

    await vi.waitFor(() => {
      expect(container.textContent).toBe("signed-out")
    })

    const [url, init] = requestInit()
    const headers = new Headers(init.headers)

    expect(url).toBe(signOutUrl)
    expect(init.method).toBe("POST")
    expect(init.credentials).toBe("include")
    expect(init.body).toBe("{}")
    expect(headers.get("Authorization")).toBe("Bearer session-token")
    expect(headers.get("Content-Type")).toBe("application/json")
    expect(sessionStorage.getItem(tokenKey)).toBeNull()
    expect(authClient.$store.atoms.$sessionSignal.get()).toBe(!signalBefore)
  })

  it("omits the authorization header when there is no token", async () => {
    stubFetch(200)

    renderHarness()
    await submit()

    await vi.waitFor(() => {
      expect(container.textContent).toBe("signed-out")
    })

    const [, init] = requestInit()
    const headers = new Headers(init.headers)

    expect(headers.get("Authorization")).toBeNull()
    expect(init.body).toBe("{}")
  })

  it("keeps the token when sign-out fails", async () => {
    sessionStorage.setItem(tokenKey, "session-token")
    const signalBefore = authClient.$store.atoms.$sessionSignal.get()
    stubFetch(401)

    renderHarness()
    await submit()

    await vi.waitFor(() => {
      expect(container.textContent).toBe("rejected")
    })

    expect(sessionStorage.getItem(tokenKey)).toBe("session-token")
    expect(authClient.$store.atoms.$sessionSignal.get()).toBe(signalBefore)
  })
})
