//* Libraries imports
import { describe, expect, it } from "vitest"

//* Schema imports
import type { Card } from "@/src/schemas/card"

//* Lib imports
import { toAuctioneerCard } from "@/src/lib/cards/to-auctioneer-card"

function card(overrides: Partial<Card> = {}): Card {
  return {
    id: 89631139,
    name: "Blue-Eyes White Dragon",
    type: "Normal Monster",
    humanReadableCardType: "Normal Monster",
    frameType: "normal",
    desc: "This legendary dragon is a powerful engine of destruction.",
    ygoprodeck_url: "https://ygoprodeck.com/card/blue-eyes-white-dragon-4007",
    card_images: [
      {
        id: 89631139,
        image_url: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
        image_url_small:
          "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
      },
    ],
    card_prices: [],
    ...overrides,
  }
}

describe("toAuctioneerCard", () => {
  it("converts the numeric id to a string and keeps the name", () => {
    const auctioneerCard = toAuctioneerCard(card())

    expect(auctioneerCard.id).toBe("89631139")
    expect(auctioneerCard.name).toBe("Blue-Eyes White Dragon")
  })

  it("uses the small image url", () => {
    const auctioneerCard = toAuctioneerCard(card())

    expect(auctioneerCard.imageUrl).toBe(
      "https://images.ygoprodeck.com/images/cards_small/89631139.jpg"
    )
  })

  it("keeps the attribute when the card has one", () => {
    expect(toAuctioneerCard(card({ attribute: "LIGHT" })).attribute).toBe(
      "LIGHT"
    )
  })

  it("omits the attribute when the card has none", () => {
    expect(toAuctioneerCard(card()).attribute).toBeUndefined()
  })

  it("omits the image when the card has none", () => {
    const auctioneerCard = toAuctioneerCard(card({ card_images: [] }))

    expect(auctioneerCard.imageUrl).toBeUndefined()
  })

  describe("card type", () => {
    it("maps a spell card to spell", () => {
      const auctioneerCard = toAuctioneerCard(
        card({ type: "Spell Card", frameType: "spell" })
      )

      expect(auctioneerCard.cardType).toBe("spell")
    })

    it("maps a trap card to trap", () => {
      const auctioneerCard = toAuctioneerCard(
        card({ type: "Trap Card", frameType: "trap" })
      )

      expect(auctioneerCard.cardType).toBe("trap")
    })

    it("maps fusion, synchro, xyz, and link monsters to the extra deck", () => {
      for (const frameType of ["fusion", "synchro", "xyz", "link"]) {
        expect(toAuctioneerCard(card({ frameType })).cardType).toBe("extra")
      }
    })

    it("maps a main deck monster to monster", () => {
      const auctioneerCard = toAuctioneerCard(
        card({ type: "Effect Monster", frameType: "effect" })
      )

      expect(auctioneerCard.cardType).toBe("monster")
    })
  })
})
