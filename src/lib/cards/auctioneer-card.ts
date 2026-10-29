//* Schema imports
import type { CardAttribute } from "@/src/schemas/card"

//* Lib imports
import type { CardType } from "@/src/lib/lots/mock-lots"

export type AuctioneerCard = {
  id: string
  name: string
  cardType: CardType
  attribute?: CardAttribute
  imageUrl?: string
}
