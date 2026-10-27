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
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useIndexParticipations,
  type IndexParticipation,
} from "@/src/hooks/participations/queries/use-index-participations"

const loadingSkeletonCount = 3

const bidFilters = ["SCHEDULED", "LIVE", "ENDED", "CANCELED", "won"] as const

type BidHistoryFilter = (typeof bidFilters)[number]

function matchesFilter(
  participation: IndexParticipation,
  filter: BidHistoryFilter | null
) {
  if (filter === null) {
    return true
  }

  if (filter === "won") {
    return participation.won
  }

  return participation.status === filter
}

function matchesQuery(participation: IndexParticipation, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) {
    return true
  }

  return participation.title.toLowerCase().includes(normalizedQuery)
}

export function BidHistory() {
  const t = useTranslations("pages./my-bids")
  const participationsQuery = useIndexParticipations()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<BidHistoryFilter | null>(null)
  const participations = participationsQuery.data?.lots ?? []
  const visibleParticipations = participations.filter((participation) => {
    return (
      matchesQuery(participation, query) && matchesFilter(participation, filter)
    )
  })

  function onQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  function onFilterToggle(nextFilter: BidHistoryFilter) {
    setFilter((current) => {
      if (current === nextFilter) {
        return null
      }

      return nextFilter
    })
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
            {bidFilters.map((bidFilter) => {
              const selected = filter === bidFilter

              return (
                <Button
                  key={bidFilter}
                  id={`bid-filter-${bidFilter}`}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  onClick={() => onFilterToggle(bidFilter)}
                >
                  {t(`filters.${bidFilter}`)}
                </Button>
              )
            })}
          </div>
          {participationsQuery.isError ? (
            <p id="bid-history-error">{t("error")}</p>
          ) : participationsQuery.isPending ? (
            <>
              <p className="sr-only">{t("loading")}</p>
              <ul
                aria-labelledby="bid-history-title"
                aria-busy="true"
                className="flex flex-col gap-3"
              >
                {Array.from({ length: loadingSkeletonCount }, (_, index) => (
                  <li key={`bid-history-skeleton-${index}`}>
                    <Skeleton className="h-24 w-full" />
                  </li>
                ))}
              </ul>
            </>
          ) : participations.length === 0 ? (
            <p id="bid-history-empty">{t("empty")}</p>
          ) : visibleParticipations.length === 0 ? (
            <p id="bid-history-empty-filtered">{t("emptyFiltered")}</p>
          ) : (
            <ul id="bid-history" className="flex flex-col gap-3">
              {visibleParticipations.map((participation) => (
                <li key={participation.id} id={`bid-${participation.id}`}>
                  <BidCard participation={participation} />
                </li>
              ))}
            </ul>
          )}
        </Card.Content>
      </Card.Root>
    </section>
  )
}
