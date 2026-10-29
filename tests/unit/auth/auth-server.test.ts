//* Libraries imports
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Local imports
import { getServerSession, requireAuctioneer } from "@/src/lib/auth-server"

const requestHeaders = vi.hoisted(() => new Headers())

class RedirectError extends Error {
  readonly url: string

  constructor(url: string) {
    super(`NEXT_REDIRECT ${url}`)
    this.url = url
  }
}

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}))

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectError(url)
  },
}))

function sessionResponse(role: string | null) {
  const body =
    role == null
      ? null
      : {
          session: { id: "session-id", userId: "user-id" },
          user: { id: "user-id", role },
        }

  return new Response(JSON.stringify(body), { status: 200 })
}

describe("getServerSession", () => {
  beforeEach(() => {
    requestHeaders.set("cookie", "better-auth.session_token=token")
  })

  afterEach(() => {
    requestHeaders.delete("cookie")
    vi.unstubAllGlobals()
  })

  it("forwards the request cookies to the backend session endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sessionResponse("BIDDER"))
    vi.stubGlobal("fetch", fetchMock)

    const session = await getServerSession()

    expect(session?.user.role).toBe("BIDDER")

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)

    expect(url).toBe("http://localhost:3001/api/auth/get-session")
    expect(headers.get("Cookie")).toBe("better-auth.session_token=token")
    expect(init.cache).toBe("no-store")
  })

  it("skips the backend when the request has no cookie", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    requestHeaders.delete("cookie")

    await expect(getServerSession()).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("treats an error response as signed out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 500 }))
    )

    await expect(getServerSession()).resolves.toBeNull()
  })

  it("treats a network failure as signed out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")))

    await expect(getServerSession()).resolves.toBeNull()
  })
})

describe("requireAuctioneer", () => {
  beforeEach(() => {
    requestHeaders.set("cookie", "better-auth.session_token=token")
  })

  afterEach(() => {
    requestHeaders.delete("cookie")
    vi.unstubAllGlobals()
  })

  it("redirects a signed-out visitor to the home page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sessionResponse(null)))

    await expect(requireAuctioneer()).rejects.toMatchObject({ url: "/" })
  })

  it("redirects a bidder to the home page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sessionResponse("BIDDER")))

    await expect(requireAuctioneer()).rejects.toMatchObject({ url: "/" })
  })

  it("returns the session of an auctioneer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(sessionResponse("AUCTIONEER"))
    )

    await expect(requireAuctioneer()).resolves.toMatchObject({
      user: { role: "AUCTIONEER" },
    })
  })
})
