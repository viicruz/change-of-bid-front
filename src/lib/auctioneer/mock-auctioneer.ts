//* Lib imports
import type { CardType, LotStatus } from "@/src/lib/lots/mock-lots"

export type AuctioneerCard = {
  id: string
  name: string
  cardType: CardType
  imageUrl?: string
}

export type AuctioneerLot = {
  id: string
  title: string
  description: string
  minimalValue: number
  minimumIncrement: number
  startsAt: string
  status: LotStatus
  cards: AuctioneerCard[]
}

export const auctioneerLots: AuctioneerLot[] = [
  {
    id: "lot-blue-eyes-white-dragon",
    title: "Blue-Eyes White Dragon",
    description: "A lot built around Blue-Eyes monsters and support.",
    minimalValue: 500,
    minimumIncrement: 50,
    startsAt: "2026-10-20T15:00:00.000-03:00",
    status: "live",
    cards: [
      {
        id: "card-blue-eyes-white-dragon",
        name: "Blue-Eyes White Dragon",
        cardType: "monster",
      },
      {
        id: "card-blue-eyes-alternative",
        name: "Blue-Eyes Alternative White Dragon",
        cardType: "monster",
      },
      {
        id: "card-white-stone-of-ancients",
        name: "The White Stone of Ancients",
        cardType: "monster",
      },
      {
        id: "card-blue-eyes-ultimate-dragon",
        name: "Blue-Eyes Ultimate Dragon",
        cardType: "extra",
      },
      {
        id: "card-burst-stream",
        name: "Burst Stream of Destruction",
        cardType: "spell",
      },
      {
        id: "card-maiden-with-eyes-of-blue",
        name: "Maiden with Eyes of Blue",
        cardType: "monster",
      },
    ],
  },
  {
    id: "lot-dark-magician",
    title: "Dark Magician",
    description: "Spellcaster staples led by Dark Magician.",
    minimalValue: 400,
    minimumIncrement: 25,
    startsAt: "2026-10-21T18:00:00.000-03:00",
    status: "live",
    cards: [
      {
        id: "card-dark-magician",
        name: "Dark Magician",
        cardType: "monster",
      },
      {
        id: "card-dark-magician-girl",
        name: "Dark Magician Girl",
        cardType: "monster",
      },
    ],
  },
  {
    id: "lot-mystical-space-typhoon",
    title: "Mystical Space Typhoon",
    description: "Spell and trap removal for a short live lot.",
    minimalValue: 150,
    minimumIncrement: 10,
    startsAt: "2026-10-21T12:00:00.000-03:00",
    status: "live",
    cards: [
      {
        id: "card-mystical-space-typhoon",
        name: "Mystical Space Typhoon",
        cardType: "spell",
      },
    ],
  },
  {
    id: "lot-pot-of-greed",
    title: "Pot of Greed",
    description: "Scheduled lot with classic draw spells.",
    minimalValue: 800,
    minimumIncrement: 100,
    startsAt: "2026-11-02T15:00:00.000-03:00",
    status: "scheduled",
    cards: [
      {
        id: "card-pot-of-greed",
        name: "Pot of Greed",
        cardType: "spell",
      },
      {
        id: "card-graceful-charity",
        name: "Graceful Charity",
        cardType: "spell",
      },
    ],
  },
  {
    id: "lot-mirror-force",
    title: "Mirror Force",
    description: "Battle traps grouped into one scheduled lot.",
    minimalValue: 300,
    minimumIncrement: 20,
    startsAt: "2026-11-03T15:00:00.000-03:00",
    status: "scheduled",
    cards: [
      {
        id: "card-mirror-force",
        name: "Mirror Force",
        cardType: "trap",
      },
    ],
  },
  {
    id: "lot-red-eyes-black-dragon",
    title: "Red-Eyes Black Dragon",
    description: "Closed dragon lot kept for the auctioneer list.",
    minimalValue: 450,
    minimumIncrement: 50,
    startsAt: "2026-10-01T15:00:00.000-03:00",
    status: "closed",
    cards: [
      {
        id: "card-red-eyes-black-dragon",
        name: "Red-Eyes Black Dragon",
        cardType: "monster",
      },
    ],
  },
]

export const selectedAuctioneerLot = auctioneerLots[0]

export const catalogCards: AuctioneerCard[] = [
  {
    id: "catalog-ash-blossom",
    name: "Ash Blossom & Joyous Spring",
    cardType: "monster",
  },
  {
    id: "catalog-stardust-dragon",
    name: "Stardust Dragon",
    cardType: "extra",
  },
  {
    id: "catalog-raigeki",
    name: "Raigeki",
    cardType: "spell",
  },
  {
    id: "catalog-torrential-tribute",
    name: "Torrential Tribute",
    cardType: "trap",
  },
  {
    id: "catalog-accesscode-talker",
    name: "Accesscode Talker",
    cardType: "extra",
  },
  {
    id: "catalog-solemn-judgment",
    name: "Solemn Judgment",
    cardType: "trap",
  },
]
