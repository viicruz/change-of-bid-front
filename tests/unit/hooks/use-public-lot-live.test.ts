// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import { usePublicLotLive } from "@/src/hooks/lots/queries/use-public-lot-live"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

const lotId = "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f"

const publicLotResponse = {
  serverNow: "2026-10-27T12:00:00.000Z",
  viewerParticipantNo: 6,
  lot: {
    id: lotId,
    title: "Room Dragon",
    description: null,
    openingBid: "10.00",
    minIncrement: "1.00",
    startsAt: "2026-10-27T13:00:00.000Z",
    endsAt: "2026-10-27T15:00:00.000Z",
    extensionCount: 0,
    status: "LIVE",
    currentBid: "15.00",
    leaderParticipantNo: 4,
    bidCount: 2,
    sold: false,
    winnerParticipantNo: null,
    items: [],
    bids: [
      {
        sequence: 1,
        amount: "10.00",
        createdAt: "2026-10-27T13:10:00.000Z",
        participantNo: 2,
      },
      {
        sequence: 2,
        amount: "15.00",
        createdAt: "2026-10-27T13:20:00.000Z",
        participantNo: 4,
      },
    ],
  },
}

type SocketListener = (event: Event) => void

class FakeSocket {
  static instances: FakeSocket[] = []

  readonly url: string
  private listeners = new Map<string, Set<SocketListener>>()

  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }

  addEventListener(type: string, listener: SocketListener) {
    const current = this.listeners.get(type) ?? new Set<SocketListener>()
    current.add(listener)
    this.listeners.set(type, current)
  }

  close(code = 1000) {
    this.dispatch("close", { code })
  }

  dispatch(type: string, event: object) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event as Event)
    }
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function liveFrame(currentBid: string, serverNow: string) {
  return JSON.stringify({
    serverNow,
    lot: {
      ...publicLotResponse.lot,
      currentBid,
      bidCount: 3,
    },
  })
}

function LiveHarness(props: { id: string }) {
  const lot = useShowLot({ id: props.id })
  const status = usePublicLotLive(props.id)
  const payload = lot.data

  return createElement(
    "div",
    { id: "live-state" },
    lot.isError
      ? `error:${status}`
      : `${status}:${payload?.lot.currentBid ?? "none"}:${payload?.viewerParticipantNo ?? "none"}:${payload?.lot.bidCount ?? "none"}`
  )
}

describe("usePublicLotLive", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    FakeSocket.instances = []
    vi.stubGlobal("WebSocket", FakeSocket)
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
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  function latestSocket() {
    const socket = FakeSocket.instances.at(-1)

    if (!socket) {
      throw new Error("Expected a lot socket")
    }

    return socket
  }

  async function renderLive(id = lotId) {
    act(() => {
      root.render(
        createElement(QueryProvider, null, createElement(LiveHarness, { id }))
      )
    })
  }

  async function waitForText(text: string) {
    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toBe(text)
      })
    })
  }

  describe("when a snapshot arrives", () => {
    it("replaces the lot and keeps the viewer number from the read", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse(publicLotResponse))
      )

      await renderLive()
      await waitForText("connecting:15.00:6:2")

      const socket = latestSocket()

      expect(socket.url).toBe(`ws://localhost:3001/public/lots/${lotId}/live`)

      await act(async () => {
        socket.dispatch("open", {})
        socket.dispatch("message", {
          data: liveFrame("20.00", "2026-10-27T12:05:00.000Z"),
        })
      })

      expect(container.textContent).toBe("open:20.00:6:3")
    })

    it("ignores an older frame and a payload that is not a lot snapshot", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse(publicLotResponse))
      )

      await renderLive()
      await waitForText("connecting:15.00:6:2")

      const socket = latestSocket()

      await act(async () => {
        socket.dispatch("message", { data: "not-json" })
        socket.dispatch("message", { data: JSON.stringify({ lot: null }) })
        socket.dispatch("message", { data: new ArrayBuffer(1) })
        socket.dispatch("message", {
          data: liveFrame("99.00", "2026-10-27T11:00:00.000Z"),
        })
      })

      expect(container.textContent).toBe("connecting:15.00:6:2")
    })
  })

  describe("when the socket closes", () => {
    it("does not reconnect after a normal close", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse(publicLotResponse))
      )

      await renderLive()
      await waitForText("connecting:15.00:6:2")
      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("open", {})
        latestSocket().dispatch("close", { code: 1000 })
        await vi.advanceTimersByTimeAsync(20_000)
      })

      expect(FakeSocket.instances).toHaveLength(1)
      expect(container.textContent).toBe("open:15.00:6:2")
    })

    it("reconnects after the live snapshot fails", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse(publicLotResponse))
      )

      await renderLive()
      await waitForText("connecting:15.00:6:2")
      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("open", {})
        latestSocket().dispatch("close", { code: 1011 })
      })

      expect(container.textContent).toBe("reconnecting:15.00:6:2")

      await act(async () => {
        await vi.advanceTimersByTimeAsync(999)
      })

      expect(FakeSocket.instances).toHaveLength(1)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1)
      })

      expect(FakeSocket.instances).toHaveLength(2)
      expect(FakeSocket.instances[1]?.url).toBe(
        `ws://localhost:3001/public/lots/${lotId}/live`
      )
    })

    it("refreshes the lot after an opened socket reconnects", async () => {
      const refreshedResponse = {
        ...publicLotResponse,
        serverNow: "2026-10-27T12:30:00.000Z",
        lot: {
          ...publicLotResponse.lot,
          currentBid: "25.00",
          bidCount: 3,
        },
      }
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(publicLotResponse))
        .mockResolvedValueOnce(jsonResponse(refreshedResponse))

      vi.stubGlobal("fetch", fetchMock)

      await renderLive()
      await waitForText("connecting:15.00:6:2")
      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("open", {})
        latestSocket().dispatch("close", { code: 1006 })
        await vi.advanceTimersByTimeAsync(1000)
      })

      await act(async () => {
        latestSocket().dispatch("open", {})
        await vi.waitFor(() => {
          expect(container.textContent).toBe("open:25.00:6:3")
        })
      })

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it("reconnects with backoff after a dropped connection and resets it once the socket opens", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse(publicLotResponse))
      )

      await renderLive()
      await waitForText("connecting:15.00:6:2")
      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("open", {})
        latestSocket().dispatch("close", { code: 1006 })
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(FakeSocket.instances).toHaveLength(2)

      await act(async () => {
        latestSocket().dispatch("open", {})
        latestSocket().dispatch("close", { code: 1006 })
        await vi.advanceTimersByTimeAsync(999)
      })

      expect(FakeSocket.instances).toHaveLength(2)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1)
      })

      expect(FakeSocket.instances).toHaveLength(3)
    })
  })

  describe("when the socket never opens", () => {
    it("stops retrying when the lot does not exist", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          jsonResponse(
            {
              code: "LOT_NOT_FOUND",
              message: "Lot was not found.",
            },
            404
          )
        )
      )

      await renderLive()

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.textContent).toBe("error:connecting")
        })
      })

      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("close", { code: 1006 })
      })

      expect(container.textContent).toBe("error:stopped")

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20_000)
      })

      expect(FakeSocket.instances).toHaveLength(1)
    })

    it("stops retrying when the lot id is rejected", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          jsonResponse(
            {
              type: "validation",
              message: "Validation failure.",
            },
            422
          )
        )
      )

      await renderLive()

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.textContent).toBe("error:connecting")
        })
      })

      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("close", { code: 1006 })
      })

      expect(container.textContent).toBe("error:stopped")

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20_000)
      })

      expect(FakeSocket.instances).toHaveLength(1)
    })

    it("shows a connection problem and retries when the lot still exists", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse(publicLotResponse))
      )

      await renderLive()
      await waitForText("connecting:15.00:6:2")
      vi.useFakeTimers()

      await act(async () => {
        latestSocket().dispatch("close", { code: 1006 })
      })

      expect(container.textContent).toBe("unavailable:15.00:6:2")

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(FakeSocket.instances).toHaveLength(2)
      expect(container.textContent).toContain("15.00")
      expect(container.textContent).not.toContain("error")
    })

    it("does not open a socket when the id is not a uuid", async () => {
      const fetchMock = vi.fn()
      vi.stubGlobal("fetch", fetchMock)

      await renderLive("not-a-uuid")

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.textContent).toBe("idle:none:none:none")
      expect(fetchMock).not.toHaveBeenCalled()
      expect(FakeSocket.instances).toHaveLength(0)
    })
  })
})
