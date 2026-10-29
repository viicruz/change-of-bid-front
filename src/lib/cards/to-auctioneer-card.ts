//* Schema imports
import type { Card } from "@/src/schemas/card"

//* Lib imports
import type { AuctioneerCard } from "@/src/lib/cards/auctioneer-card"
import type { CardType } from "@/src/lib/cards/card-types"

const extraDeckFrames = new Set(["fusion", "synchro", "xyz", "link"])

function toCardType(card: Card): CardType {
  if (card.type === "Spell Card") {
    return "spell"
  }

  if (card.type === "Trap Card") {
    return "trap"
  }

  if (extraDeckFrames.has(card.frameType)) {
    return "extra"
  }

  return "monster"
}

export function toAuctioneerCard(card: Card): AuctioneerCard {
  const imageUrl = card.card_images[0]?.image_url_small

  return {
    id: String(card.id),
    name: card.name,
    cardType: toCardType(card),
    ...(card.attribute ? { attribute: card.attribute } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  }
}
