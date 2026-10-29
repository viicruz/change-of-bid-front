//* Lib imports
import type { CardType } from "@/src/lib/cards/card-types"

export const lotStatuses = ["live", "scheduled", "canceled", "closed"] as const

export type LotStatus = (typeof lotStatuses)[number]

export type Lot = {
  id: string
  name: string
  cardType: CardType
  status: LotStatus
  currentBid: number
  startsAt: string
  endsAt: string
}

export const mockLots: Lot[] = [
  {
    id: "lot-blue-eyes-white-dragon",
    name: "Blue-Eyes White Dragon",
    cardType: "monster",
    status: "live",
    currentBid: 1500,
    startsAt: "2026-10-20T15:00:00.000-03:00",
    endsAt: "2026-10-28T21:00:00.000-03:00",
  },
  {
    id: "lot-dark-magician",
    name: "Dark Magician",
    cardType: "monster",
    status: "live",
    currentBid: 1200,
    startsAt: "2026-10-20T15:00:00.000-03:00",
    endsAt: "2026-10-28T21:00:00.000-03:00",
  },
  {
    id: "lot-mystical-space-typhoon",
    name: "Mystical Space Typhoon",
    cardType: "spell",
    status: "live",
    currentBid: 350,
    startsAt: "2026-10-21T12:00:00.000-03:00",
    endsAt: "2026-10-29T18:00:00.000-03:00",
  },
  {
    id: "lot-mirror-force",
    name: "Mirror Force",
    cardType: "trap",
    status: "live",
    currentBid: 640,
    startsAt: "2026-10-21T12:00:00.000-03:00",
    endsAt: "2026-10-29T18:00:00.000-03:00",
  },
  {
    id: "lot-stardust-dragon",
    name: "Stardust Dragon",
    cardType: "extra",
    status: "live",
    currentBid: 2200,
    startsAt: "2026-10-22T16:00:00.000-03:00",
    endsAt: "2026-10-30T20:00:00.000-03:00",
  },
  {
    id: "lot-ash-blossom",
    name: "Ash Blossom & Joyous Spring",
    cardType: "monster",
    status: "live",
    currentBid: 1750,
    startsAt: "2026-10-22T16:00:00.000-03:00",
    endsAt: "2026-10-30T20:00:00.000-03:00",
  },
  {
    id: "lot-pot-of-greed",
    name: "Pot of Greed",
    cardType: "spell",
    status: "scheduled",
    currentBid: 980,
    startsAt: "2026-11-02T15:00:00.000-03:00",
    endsAt: "2026-11-05T21:00:00.000-03:00",
  },
  {
    id: "lot-solemn-judgment",
    name: "Solemn Judgment",
    cardType: "trap",
    status: "scheduled",
    currentBid: 1300,
    startsAt: "2026-11-03T15:00:00.000-03:00",
    endsAt: "2026-11-06T21:00:00.000-03:00",
  },
  {
    id: "lot-accesscode-talker",
    name: "Accesscode Talker",
    cardType: "extra",
    status: "scheduled",
    currentBid: 2600,
    startsAt: "2026-11-04T15:00:00.000-03:00",
    endsAt: "2026-11-07T21:00:00.000-03:00",
  },
  {
    id: "lot-monster-reborn",
    name: "Monster Reborn",
    cardType: "spell",
    status: "canceled",
    currentBid: 420,
    startsAt: "2026-09-15T15:00:00.000-03:00",
    endsAt: "2026-09-20T21:00:00.000-03:00",
  },
  {
    id: "lot-red-eyes-black-dragon",
    name: "Red-Eyes Black Dragon",
    cardType: "monster",
    status: "closed",
    currentBid: 870,
    startsAt: "2026-10-01T15:00:00.000-03:00",
    endsAt: "2026-10-10T21:00:00.000-03:00",
  },
  {
    id: "lot-raigeki",
    name: "Raigeki",
    cardType: "spell",
    status: "closed",
    currentBid: 540,
    startsAt: "2026-10-02T15:00:00.000-03:00",
    endsAt: "2026-10-11T21:00:00.000-03:00",
  },
  {
    id: "lot-torrential-tribute",
    name: "Torrential Tribute",
    cardType: "trap",
    status: "closed",
    currentBid: 410,
    startsAt: "2026-10-03T15:00:00.000-03:00",
    endsAt: "2026-10-12T21:00:00.000-03:00",
  },
]

export function filterLots(
  lots: Lot[],
  query: string,
  selectedTypes: CardType[]
) {
  const normalizedQuery = query.trim().toLowerCase()

  return lots.filter((lot) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      lot.name.toLowerCase().includes(normalizedQuery)
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(lot.cardType)

    return matchesQuery && matchesType
  })
}
