"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { AuctioneerCardTile } from "@/src/components/auctioneer/auctioneer-card-tile"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import {
  catalogCards,
  type AuctioneerCard,
} from "@/src/lib/auctioneer/mock-auctioneer"
import { cardTypes } from "@/src/lib/lots/mock-lots"

type CardSearchPanelProps = {
  idPrefix?: string
  framed?: boolean
  onSelectCard?: (card: AuctioneerCard) => void
}

export function CardSearchPanel(props: CardSearchPanelProps) {
  const t = useTranslations("pages./auctioneer")
  const idPrefix = props.idPrefix ?? ""
  const framed = props.framed ?? true
  const titleId = `${idPrefix}card-search-title`

  const fields = (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}card-search`}>{t("cardSearchLabel")}</Label>
        <Input
          id={`${idPrefix}card-search`}
          type="search"
          placeholder={t("cardSearchPlaceholder")}
        />
      </div>
      <div
        id={`${idPrefix}card-search-filters`}
        role="group"
        aria-label={t("cardFiltersLabel")}
        className="flex flex-wrap gap-2"
      >
        {cardTypes.map((cardType) => (
          <Button
            key={cardType}
            id={`${idPrefix}card-search-filter-${cardType}`}
            type="button"
            variant="outline"
          >
            {t(`cardTypes.${cardType}`)}
          </Button>
        ))}
      </div>
      <ul
        id={`${idPrefix}card-search-results`}
        aria-labelledby={titleId}
        className="grid grid-cols-2 gap-3"
      >
        {catalogCards.map((card) => (
          <li key={card.id}>
            <AuctioneerCardTile
              card={card}
              idPrefix={idPrefix}
              onSelect={props.onSelectCard}
            />
          </li>
        ))}
      </ul>
    </>
  )

  if (!framed) {
    return (
      <div id={`${idPrefix}card-search-panel`} className="flex flex-col gap-4">
        {fields}
      </div>
    )
  }

  return (
    <Card.Root id={`${idPrefix}card-search-panel`} className="h-full">
      <Card.Header>
        <Card.Title>
          <h2 id={titleId} className="text-center">
            {t("cardSearchTitle")}
          </h2>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">{fields}</Card.Content>
    </Card.Root>
  )
}
