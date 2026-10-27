// @vitest-environment happy-dom

//* Libraries imports
import { afterEach, describe, expect, it, vi } from "vitest"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"

//* Local imports
import { api } from "@/src/lib/api"

const tokenKey = "change-of-bid.bearer-token"

const successSchema = z.object({
  ok: z.literal(true),
})

function getOptions() {
  return {
    url: "/private/lots",
    schema: successSchema,
    errorSchema: apiResponseErrorSchema,
  }
}

describe("api.get", () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it("sends the bearer token when a session is stored", async () => {
    sessionStorage.setItem(tokenKey, "session-token")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      )
    vi.stubGlobal("fetch", fetchMock)

    const result = await api.get(getOptions())

    expect(result).toEqual({ ok: true })

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = new Headers(init.headers)

    expect(url.href).toBe("http://localhost:3001/private/lots")
    expect(init.method).toBe("GET")
    expect(headers.get("Authorization")).toBe("Bearer session-token")
    expect(headers.get("Accept")).toBe("application/json")
    expect(headers.get("Content-Type")).toBeNull()
  })

  it("omits the authorization header when no session token is stored", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      )
    vi.stubGlobal("fetch", fetchMock)

    await api.get(getOptions())

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = new Headers(init.headers)

    expect(headers.get("Authorization")).toBeNull()
  })
})
