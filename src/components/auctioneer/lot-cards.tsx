"use client"

//* Libraries imports
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

//* Components imports
import { AuctioneerCardTile } from "@/src/components/auctioneer/auctioneer-card-tile"

//* Lib imports
import type { AuctioneerCard } from "@/src/lib/auctioneer/mock-auctioneer"

type LotCardsProps = {
  cards: AuctioneerCard[]
  idPrefix?: string
  action?: ReactNode
}

export function LotCards(props: LotCardsProps) {
  const t = useTranslations("pages./auctioneer")
  const idPrefix = props.idPrefix ?? ""
  const titleId = `${idPrefix}cards-in-lot-title`

  return (
    <div className="flex flex-col gap-4">
      <h2
        id={titleId}
        className="text-center font-heading text-base font-medium"
      >
        {t("cardsInLot")}
      </h2>
      {props.action}
      <ul
        id={`${idPrefix}cards-in-lot`}
        aria-labelledby={titleId}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
      >
        {props.cards.map((card) => (
          <li key={card.id}>
            <AuctioneerCardTile card={card} idPrefix={idPrefix} />
          </li>
        ))}
      </ul>
    </div>
  )
}
