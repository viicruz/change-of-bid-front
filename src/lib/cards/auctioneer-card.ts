//* Schema imports
import type { CardAttribute } from "@/src/schemas/card"

//* Lib imports
import type { CardType } from "@/src/lib/cards/card-types"

export type AuctioneerCard = {
  id: string
  name: string
  cardType: CardType
  attribute?: CardAttribute
  imageUrl?: string
}
