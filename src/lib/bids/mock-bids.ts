export type Bid = {
  id: string
  lotId: string
  lotName: string
  amount: number
  placedAt: string
}

export const mockBids: Bid[] = [
  {
    id: "bid-ash-blossom",
    lotId: "lot-ash-blossom",
    lotName: "Ash Blossom & Joyous Spring",
    amount: 1800,
    placedAt: "2026-10-25T14:20:00.000-03:00",
  },
  {
    id: "bid-stardust-dragon",
    lotId: "lot-stardust-dragon",
    lotName: "Stardust Dragon",
    amount: 2250,
    placedAt: "2026-10-25T11:05:00.000-03:00",
  },
  {
    id: "bid-blue-eyes-white-dragon",
    lotId: "lot-blue-eyes-white-dragon",
    lotName: "Blue-Eyes White Dragon",
    amount: 1600,
    placedAt: "2026-10-24T19:40:00.000-03:00",
  },
  {
    id: "bid-mirror-force",
    lotId: "lot-mirror-force",
    lotName: "Mirror Force",
    amount: 700,
    placedAt: "2026-10-24T16:15:00.000-03:00",
  },
  {
    id: "bid-dark-magician",
    lotId: "lot-dark-magician",
    lotName: "Dark Magician",
    amount: 1250,
    placedAt: "2026-10-23T18:10:00.000-03:00",
  },
]

export function bidsNewestFirst(bids: Bid[]) {
  return [...bids].sort((left, right) => {
    return (
      new Date(right.placedAt).getTime() - new Date(left.placedAt).getTime()
    )
  })
}
