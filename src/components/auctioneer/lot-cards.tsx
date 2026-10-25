"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { AuctioneerCardTile } from "@/src/components/auctioneer/auctioneer-card-tile"

//* Lib imports
import type { AuctioneerCard } from "@/src/lib/auctioneer/mock-auctioneer"

type LotCardsProps = {
  cards: AuctioneerCard[]
}

export function LotCards(props: LotCardsProps) {
  const t = useTranslations("pages./auctioneer")

  return (
    <div className="flex flex-col gap-4">
      <h2
        id="cards-in-lot-title"
        className="text-center font-heading text-base font-medium"
      >
        {t("cardsInLot")}
      </h2>
      <ul
        id="cards-in-lot"
        aria-labelledby="cards-in-lot-title"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
      >
        {props.cards.map((card) => (
          <li key={card.id}>
            <AuctioneerCardTile card={card} />
          </li>
        ))}
      </ul>
    </div>
  )
}
