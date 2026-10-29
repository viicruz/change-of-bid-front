// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import {
  useCancelLot,
  type CanceledLot,
} from "@/src/hooks/lots/mutations/use-cancel-lot"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"
const lotId = "3f1c2a4e-8b0d-4e6a-9c11-2d5f7a8b9c0d"

const canceledLotResponse = {
  id: lotId,
  status: "CANCELED",
  canceledAt: "2026-10-27T03:39:00.000Z",
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function CancelLotHarness(props: { id: string }) {
  const cancelLot = useCancelLot()

  return createElement(
    "button",
    {
      id: "cancel-lot-submit",
      type: "button",
      onClick: () => {
        void cancelLot.mutateAsync({ id: props.id }).catch(() => undefined)
      },
    },
    cancelLot.isSuccess
      ? `canceled:${cancelLot.data.status}:${String(cancelLot.data.canceledAt instanceof Date)}`
      : cancelLot.isError
        ? `error:${cancelLot.error instanceof ApiError ? ((cancelLot.error.body as { code?: string }).code ?? cancelLot.error.status) : "unknown"}`
        : "idle"
  )
}

describe("useCancelLot", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    sessionStorage.clear()
    sessionStorage.setItem(tokenKey, "session-token")
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    queryClient.clear()
    sessionStorage.clear()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function renderAndSubmit(id: string, expected: string) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(CancelLotHarness, { id })
        )
      )
    })

    const button = container.querySelector("button")

    await act(async () => {
      button?.click()
      await vi.waitFor(() => {
        expect(container.textContent).toBe(expected)
      })
    })
  }

  function lastRequest() {
    const fetchMock = vi.mocked(fetch)
    const call = fetchMock.mock.calls.at(-1)

    if (!call) {
      throw new Error("Expected a cancel lot request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  it("posts the lot id with no body and invalidates the lots collection", async () => {
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(canceledLotResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "canceled:CANCELED:true")

    const request = lastRequest()
    const canceledLot = queryClient.getMutationCache().getAll().at(-1)?.state
      .data as CanceledLot

    expect(request.url.href).toBe(
      `http://localhost:3000/backend/private/lots/${lotId}/cancel`
    )
    expect(request.init.method).toBe("POST")
    expect(request.init.body).toBeUndefined()
    expect(request.headers.get("Authorization")).toBe("Bearer session-token")
    expect(request.headers.get("Accept")).toBe("application/json")
    expect(request.headers.get("Content-Type")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(canceledLot).toEqual({
      id: lotId,
      status: "CANCELED",
      canceledAt: new Date("2026-10-27T03:39:00.000Z"),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.LOTS.ALL],
    })

    invalidateQueries.mockRestore()
  })

  it("does not call the API when the id is not a UUID", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit("not-a-uuid", "error:unknown")

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("exposes the business code when the lot cannot be canceled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "LOT_NOT_CANCELABLE",
          message: "Only a scheduled or live lot can be canceled.",
        },
        409
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndSubmit(lotId, "error:LOT_NOT_CANCELABLE")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
