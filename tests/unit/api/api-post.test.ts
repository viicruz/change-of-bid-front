// @vitest-environment happy-dom

//* Libraries imports
import { afterEach, describe, expect, it, vi } from "vitest"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"

//* Local imports
import { ApiError, api } from "@/src/lib/api"

const tokenKey = "change-of-bid.bearer-token"

const successSchema = z.object({
  ok: z.literal(true),
})

function postOptions() {
  return {
    url: "/private/lots",
    body: { title: "Blue-Eyes lot" },
    schema: successSchema,
    errorSchema: apiResponseErrorSchema,
  }
}

describe("api.post", () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.unstubAllGlobals()
  })

  it("sends the bearer token and the JSON body", async () => {
    sessionStorage.setItem(tokenKey, "session-token")
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await api.post(postOptions())

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = new Headers(init.headers)

    expect(url.href).toBe("http://localhost:3000/backend/private/lots")
    expect(init.method).toBe("POST")
    expect(init.body).toBe(JSON.stringify({ title: "Blue-Eyes lot" }))
    expect(headers.get("Authorization")).toBe("Bearer session-token")
    expect(headers.get("Content-Type")).toBe("application/json")
  })

  it("omits the body and the content type when no body is provided", async () => {
    sessionStorage.setItem(tokenKey, "session-token")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      )
    vi.stubGlobal("fetch", fetchMock)

    await api.post({
      url: "/private/lots/3f1c2a4e-8b0d-4e6a-9c11-2d5f7a8b9c0d/cancel",
      schema: successSchema,
      errorSchema: apiResponseErrorSchema,
    })

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = new Headers(init.headers)

    expect(url.href).toBe(
      "http://localhost:3000/backend/private/lots/3f1c2a4e-8b0d-4e6a-9c11-2d5f7a8b9c0d/cancel"
    )
    expect(init.method).toBe("POST")
    expect(init.body).toBeUndefined()
    expect(headers.get("Authorization")).toBe("Bearer session-token")
    expect(headers.get("Accept")).toBe("application/json")
    expect(headers.get("Content-Type")).toBeNull()
  })

  it("omits the authorization header when no session token is stored", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 201 })
      )
    vi.stubGlobal("fetch", fetchMock)

    await api.post(postOptions())

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = new Headers(init.headers)

    expect(headers.get("Authorization")).toBeNull()
  })

  it("keeps a plain-text 401 body without parsing it as JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("Unauthorized", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    const error = await api
      .post(postOptions())
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 401,
      message: "Unauthorized",
      body: "Unauthorized",
    })
  })

  it("keeps the business code and card ids from a 422 body", async () => {
    const errorBody = {
      code: "UNKNOWN_CARDS",
      message: "One or more cards are not in the catalog.",
      cardIds: [123],
    }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(errorBody), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(api.post(postOptions())).rejects.toMatchObject({
      status: 422,
      message: errorBody.message,
      body: errorBody,
    })
  })
})
