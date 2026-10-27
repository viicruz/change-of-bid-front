"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState, type ChangeEvent } from "react"

//* Components imports
import {
  AuctioneerLotList,
  auctioneerLotStatusLabelKey,
} from "@/src/components/auctioneer/auctioneer-lot-list"
import { CreateLotButton } from "@/src/components/auctioneer/create-lot-button"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import Sidebar from "@/src/components/ui/sidebar"

//* Hooks imports
import { useDebounce } from "@/src/hooks/use-debounce"
import { useIsMobile } from "@/src/hooks/use-mobile"

//* Schema imports
import type { PrivateLotStatus } from "@/src/schemas/lot"

const searchDebounceMs = 300

const auctioneerLotFilters = [
  "LIVE",
  "SCHEDULED",
  "ENDED",
  "CANCELED",
] as const satisfies readonly PrivateLotStatus[]

export function AuctioneerSidebar() {
  const t = useTranslations("pages./auctioneer")
  const isMobile = useIsMobile()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<PrivateLotStatus | undefined>(undefined)
  const debouncedQuery = useDebounce(query, searchDebounceMs)

  function onQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  function onStatusToggle(nextStatus: PrivateLotStatus) {
    setStatus((current) => {
      if (current === nextStatus) {
        return undefined
      }

      return nextStatus
    })
  }

  return (
    <Sidebar.Root
      id="auctioneer-sidebar"
      collapsible={isMobile ? "offcanvas" : "none"}
      className={
        isMobile
          ? undefined
          : "h-full shrink-0 rounded-xl ring-1 ring-foreground/10 max-md:hidden"
      }
    >
      <Sidebar.Header className="gap-4 p-4">
        <CreateLotButton />
        <div className="flex flex-col gap-2">
          <Label htmlFor="auctioneer-lot-search">{t("lotSearchLabel")}</Label>
          <Sidebar.Input
            id="auctioneer-lot-search"
            type="search"
            value={query}
            placeholder={t("lotSearchPlaceholder")}
            onChange={onQueryChange}
          />
        </div>
        <div
          id="auctioneer-lot-filters"
          role="group"
          aria-label={t("lotFiltersLabel")}
          className="flex flex-wrap gap-2"
        >
          {auctioneerLotFilters.map((filterStatus) => {
            const selected = status === filterStatus

            return (
              <Button
                key={filterStatus}
                id={`auctioneer-lot-filter-${filterStatus}`}
                type="button"
                size="xs"
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                onClick={() => onStatusToggle(filterStatus)}
              >
                {t(`statuses.${auctioneerLotStatusLabelKey[filterStatus]}`)}
              </Button>
            )
          })}
        </div>
      </Sidebar.Header>
      <Sidebar.Content className="px-2 py-2">
        <AuctioneerLotList query={debouncedQuery} status={status} />
      </Sidebar.Content>
    </Sidebar.Root>
  )
}
