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
import { catalogCards } from "@/src/lib/auctioneer/mock-auctioneer"
import { cardTypes } from "@/src/lib/lots/mock-lots"

export function CardSearchPanel() {
  const t = useTranslations("pages./auctioneer")

  return (
    <Card.Root id="card-search-panel" className="h-full">
      <Card.Header>
        <Card.Title>
          <h2 id="card-search-title" className="text-center">
            {t("cardSearchTitle")}
          </h2>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="card-search">{t("cardSearchLabel")}</Label>
          <Input
            id="card-search"
            type="search"
            placeholder={t("cardSearchPlaceholder")}
          />
        </div>
        <div
          id="card-search-filters"
          role="group"
          aria-label={t("cardFiltersLabel")}
          className="flex flex-wrap gap-2"
        >
          {cardTypes.map((cardType) => (
            <Button
              key={cardType}
              id={`card-search-filter-${cardType}`}
              type="button"
              variant="outline"
            >
              {t(`cardTypes.${cardType}`)}
            </Button>
          ))}
        </div>
        <ul
          id="card-search-results"
          aria-labelledby="card-search-title"
          className="grid grid-cols-2 gap-3"
        >
          {catalogCards.map((card) => (
            <li key={card.id}>
              <AuctioneerCardTile card={card} />
            </li>
          ))}
        </ul>
      </Card.Content>
    </Card.Root>
  )
}
