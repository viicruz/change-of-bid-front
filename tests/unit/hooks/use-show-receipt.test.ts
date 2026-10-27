// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import {
  useShowReceipt,
  type ShowReceipt,
} from "@/src/hooks/receipts/queries/use-show-receipt"

//* Local imports
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"
const shareToken = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg"
const lotId = "2d3c4b5a-1111-4222-8333-444455556666"

const publicReceiptResponse = {
  receipt: {
    lotId,
    title: "Frozen lot",
    description: "Sealed duel",
    endedAt: "2026-10-26T14:45:00.000Z",
    finalAmount: "12.50",
    winnerParticipantNo: 7,
    items: [
      {
        id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        position: 1,
        cardId: 89631139,
        quantity: 2,
        cardName: "Frozen Dragon",
        imagePath: "https://images.example/frozen.jpg",
        cardSnapshot: {
          id: 89631139,
          name: "Frozen Dragon",
          atk: 2500,
        },
      },
    ],
  },
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function queryKey(token: string) {
  return [QUERY_KEYS.RECEIPTS.ALL, QUERY_KEYS.RECEIPTS.SINGLE, token]
}

function ShowReceiptHarness(props: { shareToken: string; enabled?: boolean }) {
  const receipt = useShowReceipt(props)
  const payload = receipt.data

  return createElement(
    "div",
    { id: "public-receipt-state" },
    receipt.isSuccess && payload
      ? `success:${payload.receipt.winnerParticipantNo}:${payload.receipt.finalAmount}:${payload.receipt.items.length}:${String(payload.receipt.endedAt instanceof Date)}:${payload.receipt.description ?? "none"}`
      : receipt.isError
        ? "error"
        : "pending"
  )
}

describe("useShowReceipt", () => {
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

  async function renderAndWait(
    props: { shareToken: string; enabled?: boolean },
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(ShowReceiptHarness, props)
        )
      )
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toBe(expected)
      })
    })
  }

  function lastRequest() {
    const fetchMock = vi.mocked(fetch)
    const call = fetchMock.mock.calls.at(-1)

    if (!call) {
      throw new Error("Expected a public receipt request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  describe("when the public receipt exists", () => {
    it("requests that receipt by share token with no query or body and keeps the snapshot", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "success:7:12.50:1:true:Sealed duel")

      const request = lastRequest()
      const cached = queryClient.getQueryData<ShowReceipt>(queryKey(shareToken))

      expect(request.url.href).toBe(
        `http://localhost:3001/public/receipts/${shareToken}`
      )
      expect(request.url.search).toBe("")
      expect(request.init.method).toBe("GET")
      expect(request.init.body).toBeUndefined()
      expect(request.headers.get("Authorization")).toBe("Bearer session-token")
      expect(request.headers.get("Accept")).toBe("application/json")
      expect(request.headers.get("Content-Type")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(cached?.receipt.lotId).toBe(lotId)
      expect(cached?.receipt.title).toBe("Frozen lot")
      expect(cached?.receipt.finalAmount).toBe("12.50")
      expect(cached?.receipt.winnerParticipantNo).toBe(7)
      expect(cached?.receipt.endedAt).toEqual(
        new Date("2026-10-26T14:45:00.000Z")
      )
      expect(cached?.receipt.items[0]?.cardSnapshot).toEqual({
        id: 89631139,
        name: "Frozen Dragon",
        atk: 2500,
      })
    })

    it("accepts a receipt whose description is null", async () => {
      const response = {
        receipt: {
          ...publicReceiptResponse.receipt,
          description: null,
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "success:7:12.50:1:true:none")

      const cached = queryClient.getQueryData<ShowReceipt>(queryKey(shareToken))

      expect(cached?.receipt.description).toBeNull()
    })

    it("keeps unknown catalog fields on the card snapshot", async () => {
      const response = {
        receipt: {
          ...publicReceiptResponse.receipt,
          items: [
            {
              ...publicReceiptResponse.receipt.items[0],
              cardSnapshot: {
                name: "Frozen Dragon",
                def: 2000,
                attribute: "WATER",
              },
            },
          ],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "success:7:12.50:1:true:Sealed duel")

      const cached = queryClient.getQueryData<ShowReceipt>(queryKey(shareToken))

      expect(cached?.receipt.items[0]?.cardSnapshot).toEqual({
        name: "Frozen Dragon",
        def: 2000,
        attribute: "WATER",
      })
    })
  })

  describe("when there is no session", () => {
    it("still loads the receipt without an authorization header", async () => {
      sessionStorage.clear()
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "success:7:12.50:1:true:Sealed duel")

      const request = lastRequest()

      expect(request.headers.get("Authorization")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the server rejects the request", () => {
    it("surfaces a missing receipt and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            code: "RECEIPT_NOT_FOUND",
            message: "Receipt was not found.",
          },
          404
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("surfaces an invalid share token response and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            type: "validation",
            message: "Validation failure.",
          },
          422
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the response does not match the contract", () => {
    it("rejects money that is not a two-decimal string", async () => {
      const response = {
        receipt: {
          ...publicReceiptResponse.receipt,
          finalAmount: "12.5",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("rejects an item that has no card snapshot", async () => {
      const response = {
        receipt: {
          ...publicReceiptResponse.receipt,
          items: [
            {
              id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
              position: 1,
              cardId: 89631139,
              quantity: 2,
              cardName: "Frozen Dragon",
              imagePath: "https://images.example/frozen.jpg",
            },
          ],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ shareToken }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the query should stay idle", () => {
    it("does not request the receipt when the query is disabled", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowReceiptHarness, {
              shareToken,
              enabled: false,
            })
          )
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("pending")
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("does not request the receipt when the share token is a lot id", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowReceiptHarness, { shareToken: lotId })
          )
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("pending")
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("does not request the receipt when the share token contains a plus", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowReceiptHarness, {
              shareToken: `+${shareToken.slice(1)}`,
            })
          )
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("pending")
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("does not request the receipt when the share token contains a slash", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowReceiptHarness, {
              shareToken: `/${shareToken.slice(1)}`,
            })
          )
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("pending")
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("does not request the receipt when the share token contains padding", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicReceiptResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowReceiptHarness, {
              shareToken: `=${shareToken.slice(1)}`,
            })
          )
        )
      })

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("pending")
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
