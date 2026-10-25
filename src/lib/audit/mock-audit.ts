//* Lib imports
import { mockLots, type CardType, type Lot } from "@/src/lib/lots/mock-lots"

export const cardRarities = [
  "common",
  "rare",
  "superRare",
  "ultraRare",
  "secretRare",
] as const

export type CardRarity = (typeof cardRarities)[number]

export const cardConditions = ["mint", "nearMint", "played"] as const

export type CardCondition = (typeof cardConditions)[number]

export type LotItem = {
  id: string
  name: string
  cardType: CardType
  rarity: CardRarity
  condition: CardCondition
  setName: string
}

export type AuditBid = {
  id: string
  amount: number
  placedAt: string
  bidderName: string
}

export type LotAudit = {
  lot: Lot
  items: LotItem[]
  bids: AuditBid[]
}

type LotAuditRecord = {
  lotId: string
  items: LotItem[]
  bids: AuditBid[]
}

const mockLotAudits: LotAuditRecord[] = [
  {
    lotId: "lot-blue-eyes-white-dragon",
    items: [
      {
        id: "item-blue-eyes-white-dragon",
        name: "Blue-Eyes White Dragon",
        cardType: "monster",
        rarity: "ultraRare",
        condition: "mint",
        setName: "Legend of Blue Eyes White Dragon",
      },
      {
        id: "item-blue-eyes-alternative",
        name: "Blue-Eyes Alternative White Dragon",
        cardType: "monster",
        rarity: "ultraRare",
        condition: "nearMint",
        setName: "Shining Victories",
      },
      {
        id: "item-white-stone-of-ancients",
        name: "The White Stone of Ancients",
        cardType: "monster",
        rarity: "secretRare",
        condition: "played",
        setName: "Battles of Legend: Relentless Revenge",
      },
    ],
    bids: [
      {
        id: "audit-bid-blue-eyes-1",
        amount: 1200,
        placedAt: "2026-10-22T09:15:00.000-03:00",
        bidderName: "Eduardo Lima",
      },
      {
        id: "audit-bid-blue-eyes-2",
        amount: 1380,
        placedAt: "2026-10-23T11:20:00.000-03:00",
        bidderName: "Camila Duarte",
      },
      {
        id: "audit-bid-blue-eyes-3",
        amount: 1450,
        placedAt: "2026-10-24T19:40:00.000-03:00",
        bidderName: "Ricardo Nunes",
      },
      {
        id: "audit-bid-blue-eyes-4",
        amount: 1500,
        placedAt: "2026-10-25T16:40:00.000-03:00",
        bidderName: "Joana Ferreira",
      },
    ],
  },
  {
    lotId: "lot-dark-magician",
    items: [
      {
        id: "item-dark-magician",
        name: "Dark Magician",
        cardType: "monster",
        rarity: "ultraRare",
        condition: "nearMint",
        setName: "Legend of Blue Eyes White Dragon",
      },
      {
        id: "item-dark-magic-attack",
        name: "Dark Magic Attack",
        cardType: "spell",
        rarity: "superRare",
        condition: "mint",
        setName: "Dark Crisis",
      },
      {
        id: "item-magician-navigation",
        name: "Magician Navigation",
        cardType: "trap",
        rarity: "rare",
        condition: "played",
        setName: "The Dark Illusion",
      },
    ],
    bids: [
      {
        id: "audit-bid-dark-magician-1",
        amount: 980,
        placedAt: "2026-10-21T18:05:00.000-03:00",
        bidderName: "Felipe Rocha",
      },
      {
        id: "audit-bid-dark-magician-2",
        amount: 1100,
        placedAt: "2026-10-23T14:30:00.000-03:00",
        bidderName: "Beatriz Gomes",
      },
      {
        id: "audit-bid-dark-magician-3",
        amount: 1200,
        placedAt: "2026-10-25T10:12:00.000-03:00",
        bidderName: "Lucas Pereira",
      },
    ],
  },
  {
    lotId: "lot-mirror-force",
    items: [
      {
        id: "item-mirror-force",
        name: "Mirror Force",
        cardType: "trap",
        rarity: "ultraRare",
        condition: "mint",
        setName: "Metal Raiders",
      },
      {
        id: "item-storming-mirror-force",
        name: "Storming Mirror Force",
        cardType: "trap",
        rarity: "secretRare",
        condition: "nearMint",
        setName: "Clash of Rebellions",
      },
    ],
    bids: [
      {
        id: "audit-bid-mirror-force-1",
        amount: 540,
        placedAt: "2026-10-22T13:45:00.000-03:00",
        bidderName: "Sofia Martins",
      },
      {
        id: "audit-bid-mirror-force-2",
        amount: 600,
        placedAt: "2026-10-23T20:10:00.000-03:00",
        bidderName: "Henrique Dias",
      },
      {
        id: "audit-bid-mirror-force-3",
        amount: 640,
        placedAt: "2026-10-25T09:25:00.000-03:00",
        bidderName: "Patricia Oliveira",
      },
    ],
  },
  {
    lotId: "lot-stardust-dragon",
    items: [
      {
        id: "item-stardust-dragon",
        name: "Stardust Dragon",
        cardType: "extra",
        rarity: "ultraRare",
        condition: "mint",
        setName: "The Duelist Genesis",
      },
      {
        id: "item-stardust-spark-dragon",
        name: "Stardust Spark Dragon",
        cardType: "extra",
        rarity: "secretRare",
        condition: "nearMint",
        setName: "Primal Origin",
      },
      {
        id: "item-starlight-road",
        name: "Starlight Road",
        cardType: "trap",
        rarity: "superRare",
        condition: "played",
        setName: "Absolute Powerforce",
      },
    ],
    bids: [
      {
        id: "audit-bid-stardust-1",
        amount: 1800,
        placedAt: "2026-10-23T16:00:00.000-03:00",
        bidderName: "Vanessa Moreira",
      },
      {
        id: "audit-bid-stardust-2",
        amount: 1950,
        placedAt: "2026-10-24T12:18:00.000-03:00",
        bidderName: "Bruno Carvalho",
      },
      {
        id: "audit-bid-stardust-3",
        amount: 2100,
        placedAt: "2026-10-24T21:40:00.000-03:00",
        bidderName: "Larissa Campos",
      },
      {
        id: "audit-bid-stardust-4",
        amount: 2200,
        placedAt: "2026-10-25T15:05:00.000-03:00",
        bidderName: "Gabriel Teixeira",
      },
    ],
  },
  {
    lotId: "lot-ash-blossom",
    items: [
      {
        id: "item-ash-blossom",
        name: "Ash Blossom & Joyous Spring",
        cardType: "monster",
        rarity: "secretRare",
        condition: "mint",
        setName: "Maximum Crisis",
      },
      {
        id: "item-ghost-belle",
        name: "Ghost Belle & Haunted Mansion",
        cardType: "monster",
        rarity: "ultraRare",
        condition: "nearMint",
        setName: "Flames of Destruction",
      },
    ],
    bids: [
      {
        id: "audit-bid-ash-1",
        amount: 1550,
        placedAt: "2026-10-23T19:22:00.000-03:00",
        bidderName: "Amanda Vieira",
      },
      {
        id: "audit-bid-ash-2",
        amount: 1680,
        placedAt: "2026-10-24T17:48:00.000-03:00",
        bidderName: "Thiago Correia",
      },
      {
        id: "audit-bid-ash-3",
        amount: 1750,
        placedAt: "2026-10-25T13:33:00.000-03:00",
        bidderName: "Renata Barbosa",
      },
    ],
  },
  {
    lotId: "lot-red-eyes-black-dragon",
    items: [
      {
        id: "item-red-eyes-black-dragon",
        name: "Red-Eyes Black Dragon",
        cardType: "monster",
        rarity: "ultraRare",
        condition: "played",
        setName: "Legend of Blue Eyes White Dragon",
      },
      {
        id: "item-red-eyes-insight",
        name: "Red-Eyes Insight",
        cardType: "spell",
        rarity: "superRare",
        condition: "nearMint",
        setName: "Clash of Rebellions",
      },
      {
        id: "item-red-eyes-spirit",
        name: "Red-Eyes Spirit",
        cardType: "trap",
        rarity: "rare",
        condition: "mint",
        setName: "Clash of Rebellions",
      },
    ],
    bids: [
      {
        id: "audit-bid-red-eyes-1",
        amount: 700,
        placedAt: "2026-10-04T11:10:00.000-03:00",
        bidderName: "Carla Nogueira",
      },
      {
        id: "audit-bid-red-eyes-2",
        amount: 760,
        placedAt: "2026-10-06T15:55:00.000-03:00",
        bidderName: "Marcelo Pinto",
      },
      {
        id: "audit-bid-red-eyes-3",
        amount: 820,
        placedAt: "2026-10-08T18:20:00.000-03:00",
        bidderName: "Juliana Castro",
      },
      {
        id: "audit-bid-red-eyes-4",
        amount: 870,
        placedAt: "2026-10-10T20:05:00.000-03:00",
        bidderName: "Diego Fernandes",
      },
    ],
  },
]

function bidsNewestFirst(bids: AuditBid[]) {
  return [...bids].sort((left, right) => {
    return (
      new Date(right.placedAt).getTime() - new Date(left.placedAt).getTime()
    )
  })
}

export function getLotAudit(lotId: string): LotAudit | undefined {
  const record = mockLotAudits.find((audit) => audit.lotId === lotId)

  if (!record) {
    return undefined
  }

  const lot = mockLots.find((item) => item.id === lotId)

  if (!lot) {
    return undefined
  }

  return {
    lot,
    items: record.items,
    bids: bidsNewestFirst(record.bids),
  }
}
