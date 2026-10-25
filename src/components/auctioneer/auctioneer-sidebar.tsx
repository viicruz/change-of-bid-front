"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import {
  auctioneerLots,
  selectedAuctioneerLot,
} from "@/src/lib/auctioneer/mock-auctioneer"
import { lotStatuses } from "@/src/lib/lots/mock-lots"

export function AuctioneerSidebar() {
  const t = useTranslations("pages./auctioneer")

  return (
    <Card.Root id="auctioneer-sidebar" className="h-full">
      <Card.Content className="flex flex-col gap-4">
        <Button id="create-lot" type="button" className="w-full">
          {t("createLot")}
        </Button>
        <div className="flex flex-col gap-2">
          <Label htmlFor="auctioneer-lot-search">{t("lotSearchLabel")}</Label>
          <Input
            id="auctioneer-lot-search"
            type="search"
            placeholder={t("lotSearchPlaceholder")}
          />
        </div>
        <div
          id="auctioneer-lot-filters"
          role="group"
          aria-label={t("lotFiltersLabel")}
          className="flex flex-wrap gap-2"
        >
          {lotStatuses.map((status) => (
            <Button
              key={status}
              id={`auctioneer-lot-filter-${status}`}
              type="button"
              variant="outline"
            >
              {t(`statuses.${status}`)}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h2 id="auctioneer-lots-label" className="text-sm font-medium">
            {t("lotsLabel")}
          </h2>
          <ul
            id="auctioneer-lots"
            aria-labelledby="auctioneer-lots-label"
            className="flex flex-col gap-2"
          >
            {auctioneerLots.map((lot) => {
              const selected = lot.id === selectedAuctioneerLot.id

              return (
                <li key={lot.id}>
                  <Button
                    id={`auctioneer-lot-${lot.id}`}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    aria-current={selected ? "true" : undefined}
                    className="w-full justify-start"
                  >
                    {lot.title}
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>
      </Card.Content>
    </Card.Root>
  )
}
