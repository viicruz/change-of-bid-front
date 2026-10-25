"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState, type ChangeEvent } from "react"

//* Components imports
import { BidCard } from "@/src/components/bids/bid-card"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import { bidsNewestFirst, mockBids } from "@/src/lib/bids/mock-bids"

const bidFilters = ["leading", "outbid", "won"] as const

export function BidHistory() {
  const t = useTranslations("pages./my-bids")
  const [query, setQuery] = useState("")
  const bids = bidsNewestFirst(mockBids)

  function onQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  return (
    <section className="flex w-full flex-col gap-6 rounded-xl p-6 ring-1 ring-foreground/10">
      <Card.Root>
        <Card.Header className="items-center text-center">
          <Card.Title>
            <h2 id="bid-history-title">{t("historyTitle")}</h2>
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <Label htmlFor="bid-search">{t("searchLabel")}</Label>
          <Input
            id="bid-search"
            type="search"
            value={query}
            placeholder={t("searchPlaceholder")}
            onChange={onQueryChange}
          />
          <div
            id="bid-filters"
            role="group"
            aria-label={t("filtersLabel")}
            className="flex flex-wrap justify-center gap-2"
          >
            {bidFilters.map((filter) => (
              <Button
                key={filter}
                id={`bid-filter-${filter}`}
                type="button"
                variant="outline"
              >
                {t(`filters.${filter}`)}
              </Button>
            ))}
          </div>
          <ul id="bid-history" className="flex flex-col gap-3">
            {bids.map((bid) => (
              <li key={bid.id} id={`bid-${bid.id}`}>
                <BidCard bid={bid} />
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card.Root>
    </section>
  )
}
