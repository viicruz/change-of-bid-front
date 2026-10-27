// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useIndexPrivateLots } from "@/src/hooks/lots/queries/use-index-private-lots"

//* Schema imports
import type { PrivateLotStatus } from "@/src/schemas/lot"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"

const privateLotsResponse = {
  totalReceived: "150.00",
  lots: [
    {
      id: "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e6f",
      title: "Lote de dragões",
      description: null,
      openingBid: "10.00",
      minIncrement: "0.50",
      startsAt: "2026-10-26T18:00:00.000Z",
      endsAt: "2026-10-27T18:00:00.000Z",
      status: "LIVE",
      currentBid: "12.50",
      bidCount: 3,
      sold: false,
      receivedAmount: null,
      items: [
        {
          id: "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e70",
          position: 1,
          cardId: 42,
          quantity: 1,
          cardName: "Panel Dragon",
          imagePath: "https://images.example/panel.jpg",
        },
      ],
    },
    {
      id: "7e6d1d4f-3c2b-401f-8d3b-2b3c4d5e6f70",
      title: "Lote encerrado",
      description: "Vendido",
      openingBid: "5.00",
      minIncrement: "0.50",
      startsAt: "2026-10-20T18:00:00.000Z",
      endsAt: "2026-10-21T18:00:00.000Z",
      status: "ENDED",
      currentBid: "8.00",
      bidCount: 1,
      sold: true,
      receivedAmount: "8.00",
      items: [
        {
          id: "7e6d1d4f-3c2b-401f-8d3b-2b3c4d5e6f71",
          position: 1,
          cardId: 7,
          quantity: 1,
          cardName: "Alexandrite Dragon",
          imagePath: "https://images.example/alexandrite.jpg",
        },
      ],
    },
  ],
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function PrivateLotsHarness(props: { q?: string; status?: PrivateLotStatus }) {
  const privateLots = useIndexPrivateLots(props)
  const payload = privateLots.data

  return createElement(
    "div",
    { id: "private-lots-state" },
    privateLots.isSuccess && payload
      ? `success:${payload.totalReceived}:${payload.lots.length}:${payload.lots[0]?.status ?? "none"}:${String(payload.lots[0]?.startsAt instanceof Date)}`
      : privateLots.isError
        ? "error"
        : "pending"
  )
}

describe("useIndexPrivateLots", () => {
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
    props: { q?: string; status?: PrivateLotStatus },
    expected: string
  ) {
    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(PrivateLotsHarness, props)
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
      throw new Error("Expected a private lots request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      headers: new Headers(init.headers),
    }
  }

  it("requests the authenticated auctioneer lots with search and status", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(privateLotsResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(
      { q: "  dragões  ", status: "LIVE" },
      "success:150.00:2:LIVE:true"
    )

    const request = lastRequest()

    expect(request.url.href).toBe(
      "http://localhost:3001/private/lots?q=drag%C3%B5es&status=LIVE"
    )
    expect(request.headers.get("Authorization")).toBe("Bearer session-token")
    expect(request.headers.get("Accept")).toBe("application/json")
  })

  it("omits a blank search and keeps the response order and a zero total", async () => {
    const response = {
      totalReceived: "0.00",
      lots: [privateLotsResponse.lots[1], privateLotsResponse.lots[0]],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(response))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ q: "   " }, "success:0.00:2:ENDED:true")

    const request = lastRequest()

    expect(request.url.href).toBe("http://localhost:3001/private/lots")
    expect(request.url.searchParams.has("q")).toBe(false)
    expect(request.url.searchParams.has("status")).toBe(false)
  })

  it("returns an empty list when the auctioneer has no lots", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ totalReceived: "0.00", lots: [] }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({}, "success:0.00:0:none:false")

    expect(lastRequest().url.pathname).toBe("/private/lots")
  })

  it("surfaces a forbidden response for a user who is not an auctioneer", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "NOT_AUCTIONEER",
          message: "Only an auctioneer can list their lots.",
        },
        403
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({ status: "CANCELED" }, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lastRequest().url.searchParams.get("status")).toBe("CANCELED")
  })

  it("rejects a lot status that the private route does not accept", async () => {
    const invalidResponse = {
      ...privateLotsResponse,
      lots: [
        {
          ...privateLotsResponse.lots[0],
          status: "ACTIVE",
        },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(invalidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait({}, "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
