//* Libraries imports
import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import {
  applyPublicLotLiveMessage,
  mergePublicLotRead,
  publicLotCountdownTarget,
  publicLotLiveUrl,
  publicLotQueryKey,
  rememberViewerParticipant,
  remainingLotTime,
  viewerPlacedLastBid,
  viewerWasJustOutbid,
} from "@/src/lib/lots/public-lot-room"
import { QUERY_KEYS } from "@/src/lib/query-client"

const lotId = "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f"

function room(overrides: Partial<ShowLot> = {}): ShowLot {
  const lot = {
    id: lotId,
    title: "Room Dragon",
    description: null,
    openingBid: "10.00",
    minIncrement: "1.00",
    startsAt: new Date("2026-10-27T13:00:00.000Z"),
    endsAt: new Date("2026-10-27T15:00:00.000Z"),
    extensionCount: 0,
    status: "LIVE" as const,
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
        createdAt: new Date("2026-10-27T13:10:00.000Z"),
        participantNo: 6,
      },
      {
        sequence: 2,
        amount: "15.00",
        createdAt: new Date("2026-10-27T13:20:00.000Z"),
        participantNo: 4,
      },
    ],
  }

  return {
    serverNow: new Date("2026-10-27T13:20:00.000Z"),
    viewerParticipantNo: 6,
    ...overrides,
    lot: {
      ...lot,
      ...overrides.lot,
    },
  }
}

describe("publicLotLiveUrl", () => {
  it("uses ws for an http api host", () => {
    expect(publicLotLiveUrl(lotId, "http://localhost:3001")).toBe(
      `ws://localhost:3001/public/lots/${lotId}/live`
    )
  })

  it("uses wss for an https api host", () => {
    expect(publicLotLiveUrl(lotId, "https://api.example/")).toBe(
      `wss://api.example/public/lots/${lotId}/live`
    )
  })
})

describe("publicLotQueryKey", () => {
  it("matches the public lot cache key", () => {
    expect(publicLotQueryKey(lotId)).toEqual([
      QUERY_KEYS.LOTS.ALL,
      QUERY_KEYS.LOTS.SINGLE,
      lotId,
    ])
  })
})

describe("mergePublicLotRead", () => {
  it("keeps the newer cached lot and a viewer number from the read", () => {
    const cached = room({
      serverNow: new Date("2026-10-27T14:00:00.000Z"),
      viewerParticipantNo: null,
      lot: {
        ...room().lot,
        currentBid: "30.00",
      },
    })
    const body = room({
      serverNow: new Date("2026-10-27T13:00:00.000Z"),
      viewerParticipantNo: 8,
    })

    const merged = mergePublicLotRead(cached, body)

    expect(merged.lot.currentBid).toBe("30.00")
    expect(merged.serverNow).toEqual(cached.serverNow)
    expect(merged.viewerParticipantNo).toBe(8)
  })

  it("keeps a remembered viewer number when the late read has none", () => {
    const cached = room({ viewerParticipantNo: 6 })
    const body = room({
      serverNow: new Date("2026-10-27T13:00:00.000Z"),
      viewerParticipantNo: null,
      lot: {
        ...room().lot,
        currentBid: "11.00",
      },
    })

    expect(mergePublicLotRead(cached, body).viewerParticipantNo).toBe(6)
    expect(mergePublicLotRead(cached, body).lot.currentBid).toBe("15.00")
  })

  it("uses a newer read and still keeps a remembered viewer number", () => {
    const cached = room({ viewerParticipantNo: 6 })
    const body = room({
      serverNow: new Date("2026-10-27T16:00:00.000Z"),
      viewerParticipantNo: null,
      lot: {
        ...room().lot,
        currentBid: "40.00",
      },
    })

    const merged = mergePublicLotRead(cached, body)

    expect(merged.lot.currentBid).toBe("40.00")
    expect(merged.viewerParticipantNo).toBe(6)
  })

  it("returns the read when nothing is cached", () => {
    const body = room({ viewerParticipantNo: null })

    expect(mergePublicLotRead(undefined, body)).toEqual(body)
  })
})

describe("applyPublicLotLiveMessage", () => {
  it("replaces the lot and keeps the cached viewer number", () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(publicLotQueryKey(lotId), room())
    const message = room({
      serverNow: new Date("2026-10-27T14:00:00.000Z"),
      lot: {
        ...room().lot,
        currentBid: "20.00",
        bidCount: 3,
      },
    })

    applyPublicLotLiveMessage(queryClient, lotId, message)

    const cached = queryClient.getQueryData<ShowLot>(publicLotQueryKey(lotId))

    expect(cached?.lot.currentBid).toBe("20.00")
    expect(cached?.lot.bidCount).toBe(3)
    expect(cached?.viewerParticipantNo).toBe(6)
    expect(cached?.serverNow).toEqual(message.serverNow)
  })

  it("ignores a frame older than the cache", () => {
    const queryClient = new QueryClient()
    const cachedRoom = room({
      serverNow: new Date("2026-10-27T14:00:00.000Z"),
    })
    queryClient.setQueryData(publicLotQueryKey(lotId), cachedRoom)

    applyPublicLotLiveMessage(
      queryClient,
      lotId,
      room({
        serverNow: new Date("2026-10-27T13:00:00.000Z"),
        lot: {
          ...room().lot,
          currentBid: "99.00",
        },
      })
    )

    expect(queryClient.getQueryData(publicLotQueryKey(lotId))).toBe(cachedRoom)
  })
})

describe("rememberViewerParticipant", () => {
  it("stores the number when the room has none", () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(
      publicLotQueryKey(lotId),
      room({ viewerParticipantNo: null })
    )

    rememberViewerParticipant(queryClient, lotId, 6)

    expect(
      queryClient.getQueryData<ShowLot>(publicLotQueryKey(lotId))
        ?.viewerParticipantNo
    ).toBe(6)
  })

  it("does not replace a viewer number that is already stored", () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(publicLotQueryKey(lotId), room())

    rememberViewerParticipant(queryClient, lotId, 9)

    expect(
      queryClient.getQueryData<ShowLot>(publicLotQueryKey(lotId))
        ?.viewerParticipantNo
    ).toBe(6)
  })

  it("does nothing when the room is not cached", () => {
    const queryClient = new QueryClient()

    rememberViewerParticipant(queryClient, lotId, 6)

    expect(queryClient.getQueryData(publicLotQueryKey(lotId))).toBeUndefined()
  })
})

describe("viewer leadership", () => {
  it("recognizes when the viewer placed the last bid", () => {
    const winning = room({
      viewerParticipantNo: 4,
    })

    expect(viewerPlacedLastBid(winning)).toBe(true)
    expect(viewerWasJustOutbid(winning)).toBe(false)
  })

  it("recognizes when the viewer was the previous leader", () => {
    const outbid = room()

    expect(viewerPlacedLastBid(outbid)).toBe(false)
    expect(viewerWasJustOutbid(outbid)).toBe(true)
  })

  it("does not treat an earlier bidder as just outbid", () => {
    const earlier = room({
      lot: {
        ...room().lot,
        bids: [
          {
            sequence: 1,
            amount: "10.00",
            createdAt: new Date("2026-10-27T13:10:00.000Z"),
            participantNo: 6,
          },
          {
            sequence: 2,
            amount: "12.00",
            createdAt: new Date("2026-10-27T13:15:00.000Z"),
            participantNo: 3,
          },
          {
            sequence: 3,
            amount: "15.00",
            createdAt: new Date("2026-10-27T13:20:00.000Z"),
            participantNo: 4,
          },
        ],
      },
    })

    expect(viewerPlacedLastBid(earlier)).toBe(false)
    expect(viewerWasJustOutbid(earlier)).toBe(false)
  })
})

describe("public lot countdown", () => {
  it("counts to the start while the lot is scheduled and to the end while it is live", () => {
    const live = room()
    const scheduled = room({
      lot: {
        ...room().lot,
        status: "SCHEDULED",
      },
    })
    const ended = room({
      lot: {
        ...room().lot,
        status: "ENDED",
      },
    })

    expect(publicLotCountdownTarget(live.lot)).toEqual(live.lot.endsAt)
    expect(publicLotCountdownTarget(scheduled.lot)).toEqual(
      scheduled.lot.startsAt
    )
    expect(publicLotCountdownTarget(ended.lot)).toBeNull()
  })

  it("measures the remaining time from the captured server offset", () => {
    const now = new Date("2026-10-27T14:00:00.000Z").getTime()
    const serverNow = new Date("2026-10-27T14:00:02.000Z")
    const target = new Date("2026-10-27T14:00:10.000Z")
    const offset = serverNow.getTime() - now

    expect(remainingLotTime(target, offset, now)).toBe(8_000)
    expect(remainingLotTime(target, offset, now + 3_000)).toBe(5_000)
    expect(remainingLotTime(target, offset, now + 20_000)).toBe(0)
  })
})
