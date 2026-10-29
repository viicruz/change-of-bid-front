// @vitest-environment happy-dom

//* Libraries imports
import { afterEach, describe, expect, it, vi } from "vitest"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"

//* Local imports
import { api } from "@/src/lib/api"

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
    vi.unstubAllGlobals()
  })

  it("relies on the session cookie and sends no authorization header", async () => {
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

    expect(url.href).toBe("http://localhost:3000/backend/private/lots")
    expect(init.method).toBe("GET")
    expect(headers.get("Authorization")).toBeNull()
    expect(headers.get("Accept")).toBe("application/json")
    expect(headers.get("Content-Type")).toBeNull()
  })
})
