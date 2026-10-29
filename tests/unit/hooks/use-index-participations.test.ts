// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useIndexParticipations } from "@/src/hooks/participations/queries/use-index-participations"

//* Local imports
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

const participationsResponse = {
  lots: [
    {
      id: "6d8f0c3e-1b2a-4c5d-9e0f-123456789abc",
      title: "Blue-Eyes",
      description: "Main deck",
      openingBid: "10.00",
      minIncrement: "1.00",
      startsAt: "2026-10-26T15:00:00.000Z",
      endsAt: "2026-10-26T17:00:00.000Z",
      status: "LIVE",
      currentBid: "12.50",
      bidCount: 2,
      participantNo: 3,
      won: false,
      shareToken: null,
      items: [
        {
          id: "a1b2c3d4-e5f6-4890-abcd-ef1234567890",
          position: 1,
          cardId: 89631139,
          quantity: 1,
          cardName: "Blue-Eyes White Dragon",
          imagePath: "https://images.example/card.jpg",
        },
      ],
    },
    {
      id: "7e6d1d4f-3c2b-401f-8d3b-2b3c4d5e6f70",
      title: "Scheduled lot",
      description: null,
      openingBid: "5.00",
      minIncrement: "0.50",
      startsAt: "2026-10-28T15:00:00.000Z",
      endsAt: "2026-10-28T17:00:00.000Z",
      status: "SCHEDULED",
      currentBid: null,
      bidCount: 0,
      participantNo: 1,
      won: false,
      shareToken: null,
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

function ParticipationsHarness() {
  const participations = useIndexParticipations()
  const payload = participations.data
  const firstLot = payload?.lots[0]
  const secondLot = payload?.lots[1]

  return createElement(
    "div",
    { id: "participations-state" },
    participations.isSuccess && payload
      ? [
          "success",
          payload.lots.length,
          payload.lots.map((lot) => lot.id).join(","),
          firstLot?.status ?? "none",
          String(firstLot?.startsAt instanceof Date),
          String(firstLot?.endsAt instanceof Date),
          firstLot?.currentBid ?? "null",
          firstLot?.participantNo ?? "none",
          String(firstLot?.won),
          secondLot?.description ?? "null",
          secondLot?.currentBid ?? "null",
          firstLot?.shareToken ?? "null",
          secondLot?.shareToken ?? "null",
        ].join(":")
      : participations.isError
        ? "error"
        : "pending"
  )
}

function DisabledParticipationsHarness() {
  const participations = useIndexParticipations({ enabled: false })

  return createElement(
    "div",
    { id: "participations-state" },
    participations.isPending ? "pending" : "requested"
  )
}

describe("useIndexParticipations", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
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
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function renderAndWait(
    element: ReturnType<typeof createElement>,
    expected: string
  ) {
    act(() => {
      root.render(createElement(QueryProvider, null, element))
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
      throw new Error("Expected a participations request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  it("requests the bidder participations with no query and no body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(participationsResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(
      createElement(ParticipationsHarness),
      "success:2:6d8f0c3e-1b2a-4c5d-9e0f-123456789abc,7e6d1d4f-3c2b-401f-8d3b-2b3c4d5e6f70:LIVE:true:true:12.50:3:false:null:null:null:null"
    )

    const request = lastRequest()
    const cached = queryClient.getQueryData([
      QUERY_KEYS.PARTICIPATIONS.ALL,
    ]) as {
      lots: { startsAt: Date; endsAt: Date }[]
    }

    expect(request.url.href).toBe(
      "http://localhost:3000/backend/private/participations"
    )
    expect(request.url.search).toBe("")
    expect(request.init.method).toBe("GET")
    expect(request.init.body).toBeUndefined()
    expect(request.headers.get("Accept")).toBe("application/json")
    expect(request.headers.get("Content-Type")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(cached.lots[0]?.startsAt).toEqual(
      new Date("2026-10-26T15:00:00.000Z")
    )
    expect(cached.lots[0]?.endsAt).toEqual(new Date("2026-10-26T17:00:00.000Z"))
  })

  it("keeps the server order and accepts an empty list", async () => {
    const reversed = {
      lots: [participationsResponse.lots[1], participationsResponse.lots[0]],
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(reversed))
      .mockResolvedValueOnce(jsonResponse({ lots: [] }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(
      createElement(ParticipationsHarness),
      "success:2:7e6d1d4f-3c2b-401f-8d3b-2b3c4d5e6f70,6d8f0c3e-1b2a-4c5d-9e0f-123456789abc:SCHEDULED:true:true:null:1:false:Main deck:12.50:null:null"
    )

    queryClient.clear()

    await renderAndWait(
      createElement(ParticipationsHarness),
      "success:0::none:false:false:null:none:undefined:null:null:null:null"
    )

    expect(lastRequest().url.pathname).toBe("/backend/private/participations")
    expect(lastRequest().url.search).toBe("")
  })

  it("surfaces a missing session and does not retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(ParticipationsHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("surfaces a forbidden response when the user is not a bidder", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "NOT_BIDDER",
          message: "Only a bidder can list their participations.",
        },
        403
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(ParticipationsHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("keeps the share token when this bidder won the lot", async () => {
    const shareToken = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg"
    const wonResponse = {
      lots: [
        {
          ...participationsResponse.lots[0],
          status: "ENDED",
          won: true,
          shareToken,
        },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(wonResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(
      createElement(ParticipationsHarness),
      `success:1:6d8f0c3e-1b2a-4c5d-9e0f-123456789abc:ENDED:true:true:12.50:3:true:null:null:${shareToken}:null`
    )

    const cached = queryClient.getQueryData([
      QUERY_KEYS.PARTICIPATIONS.ALL,
    ]) as {
      lots: { won: boolean; shareToken: string | null }[]
    }

    expect(cached.lots[0]?.won).toBe(true)
    expect(cached.lots[0]?.shareToken).toBe(shareToken)
  })

  it("rejects a won lot that is missing its share token", async () => {
    const invalidResponse = {
      lots: [
        {
          ...participationsResponse.lots[0],
          won: true,
          shareToken: null,
        },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(invalidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(ParticipationsHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects a share token on a lot this bidder did not win", async () => {
    const invalidResponse = {
      lots: [
        {
          ...participationsResponse.lots[0],
          won: false,
          shareToken: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg",
        },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(invalidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(ParticipationsHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects a share token that is not a receipt link", async () => {
    const invalidResponse = {
      lots: [
        {
          ...participationsResponse.lots[0],
          won: true,
          shareToken: "6d8f0c3e-1b2a-4c5d-9e0f-123456789abc",
        },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(invalidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(ParticipationsHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects a lot whose status is outside the participation contract", async () => {
    const invalidResponse = {
      lots: [
        {
          ...participationsResponse.lots[0],
          status: "ACTIVE",
        },
      ],
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(invalidResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(ParticipationsHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not request participations when the query is disabled", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(participationsResponse))
    vi.stubGlobal("fetch", fetchMock)

    act(() => {
      root.render(
        createElement(
          QueryProvider,
          null,
          createElement(DisabledParticipationsHarness)
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
