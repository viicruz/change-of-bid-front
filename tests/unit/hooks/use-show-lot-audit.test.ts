// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import {
  useShowLotAudit,
  type ShowLotAudit,
} from "@/src/hooks/lots/queries/use-show-lot-audit"

//* Local imports
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"
const lotId = "3f1c2a40-7b6e-4d2a-9c11-8e5a1b0d4f22"

const publicAuditResponse = {
  audit: {
    lotId,
    status: "INTACT",
    bids: [
      {
        sequence: 1,
        amount: "10.00",
        createdAt: "2026-10-26T16:00:00.000Z",
        participantNo: 1,
      },
      {
        sequence: 2,
        amount: "12.50",
        createdAt: "2026-10-26T16:05:00.000Z",
        participantNo: 2,
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

function queryKey(id: string) {
  return [QUERY_KEYS.LOTS.ALL, QUERY_KEYS.LOTS.AUDIT, id]
}

function ShowLotAuditHarness(props: { id: string; enabled?: boolean }) {
  const audit = useShowLotAudit(props)
  const payload = audit.data
  const firstBid = payload?.audit.bids[0]

  return createElement(
    "div",
    { id: "lot-audit-state" },
    audit.isSuccess && payload
      ? `success:${payload.audit.status}:${payload.audit.bids.length}:${firstBid?.amount ?? "none"}:${firstBid?.participantNo ?? "none"}:${String(firstBid?.createdAt instanceof Date)}`
      : audit.isError
        ? "error"
        : "pending"
  )
}

describe("useShowLotAudit", () => {
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
    props: { id: string; enabled?: boolean },
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(ShowLotAuditHarness, props)
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
      throw new Error("Expected a lot audit request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  describe("when the lot audit exists", () => {
    it("requests the audit by lot id with no query or body and keeps amounts as strings", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicAuditResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "success:INTACT:2:10.00:1:true")

      const request = lastRequest()
      const cached = queryClient.getQueryData<ShowLotAudit>(queryKey(lotId))

      expect(request.url.href).toBe(
        `http://localhost:3001/public/lots/${lotId}/audit`
      )
      expect(request.url.search).toBe("")
      expect(request.init.method).toBe("GET")
      expect(request.init.body).toBeUndefined()
      expect(request.headers.get("Accept")).toBe("application/json")
      expect(request.headers.get("Content-Type")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(cached?.audit.lotId).toBe(lotId)
      expect(cached?.audit.status).toBe("INTACT")
      expect(cached?.audit.bids.map((bid) => bid.sequence)).toEqual([1, 2])
      expect(cached?.audit.bids.map((bid) => bid.amount)).toEqual([
        "10.00",
        "12.50",
      ])
      expect(cached?.audit.bids.map((bid) => bid.participantNo)).toEqual([1, 2])
      expect(cached?.audit.bids[1]?.createdAt).toEqual(
        new Date("2026-10-26T16:05:00.000Z")
      )
    })

    it("accepts an intact lot that has no bids", async () => {
      const response = {
        audit: {
          lotId,
          status: "INTACT",
          bids: [],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "success:INTACT:0:none:none:false")

      const cached = queryClient.getQueryData<ShowLotAudit>(queryKey(lotId))

      expect(cached?.audit.bids).toEqual([])
    })

    it("accepts a tampered chain and still returns the public bids", async () => {
      const response = {
        audit: {
          ...publicAuditResponse.audit,
          status: "TAMPERED",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "success:TAMPERED:2:10.00:1:true")

      const cached = queryClient.getQueryData<ShowLotAudit>(queryKey(lotId))

      expect(cached?.audit.status).toBe("TAMPERED")
      expect(cached?.audit.bids).toHaveLength(2)
    })

    it("accepts a failed verification and still returns the public bids", async () => {
      const response = {
        audit: {
          ...publicAuditResponse.audit,
          status: "VERIFICATION_FAILED",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait(
        { id: lotId },
        "success:VERIFICATION_FAILED:2:10.00:1:true"
      )

      const cached = queryClient.getQueryData<ShowLotAudit>(queryKey(lotId))

      expect(cached?.audit.status).toBe("VERIFICATION_FAILED")
    })
  })

  describe("when there is no session", () => {
    it("still loads the audit without an authorization header", async () => {
      sessionStorage.clear()
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicAuditResponse))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "success:INTACT:2:10.00:1:true")

      const request = lastRequest()

      expect(request.headers.get("Authorization")).toBeNull()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the server rejects the request", () => {
    it("surfaces a missing lot and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            code: "LOT_NOT_FOUND",
            message: "Lot was not found.",
          },
          404
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("surfaces an invalid id response and does not retry", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse(
          {
            type: "validation",
          },
          422
        )
      )
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the response does not match the contract", () => {
    it("rejects an audit status that the route does not accept", async () => {
      const response = {
        audit: {
          ...publicAuditResponse.audit,
          status: "VALID",
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("rejects an amount that is not a decimal string", async () => {
      const response = {
        audit: {
          ...publicAuditResponse.audit,
          bids: [
            {
              ...publicAuditResponse.audit.bids[0],
              amount: 10,
            },
          ],
        },
      }
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
      vi.stubGlobal("fetch", fetchMock)

      await renderAndWait({ id: lotId }, "error")

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("when the query should stay idle", () => {
    it("does not request the audit when the query is disabled", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicAuditResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowLotAuditHarness, {
              id: lotId,
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

    it("does not request the audit when the id is not a uuid", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(jsonResponse(publicAuditResponse))
      vi.stubGlobal("fetch", fetchMock)

      act(() => {
        root.render(
          createElement(
            QueryProvider,
            null,
            createElement(ShowLotAuditHarness, { id: "not-a-uuid" })
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
