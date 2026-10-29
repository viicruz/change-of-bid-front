"use client"

//* Libraries imports
import { SearchIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, type ChangeEvent } from "react"

//* Components imports
import {
  AuctioneerLotList,
  auctioneerLotStatusLabelKey,
} from "@/src/components/auctioneer/auctioneer-lot-list"
import {
  AuctioneerPaneHeader,
  auctioneerPaneClassName,
} from "@/src/components/auctioneer/auctioneer-pane"
import { LotDraftItem } from "@/src/components/auctioneer/lot-draft-item"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Hooks imports
import { useIndexPrivateLots } from "@/src/hooks/lots/queries/use-index-private-lots"
import { useDebounce } from "@/src/hooks/use-debounce"

//* Schema imports
import type { PrivateLotStatus } from "@/src/schemas/lot"

//* Lib imports
import { cn } from "@/src/lib/utils"

const searchDebounceMs = 300

const auctioneerLotFilters = [
  "LIVE",
  "SCHEDULED",
  "ENDED",
  "CANCELED",
] as const satisfies readonly PrivateLotStatus[]

type AuctioneerSidebarProps = {
  selectedLotId: string | null
  //* Highlighted with a "new" badge, such as the lot just published
  newLotId: string | null
  status: PrivateLotStatus | undefined
  onStatusChange: (status: PrivateLotStatus | undefined) => void
  onSelectLot: (lotId: string) => void
  onOpenDraft: () => void
  className?: string
}

function FilterButton(props: {
  id: string
  label: string
  count?: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Button
      id={props.id}
      type="button"
      size="xs"
      variant={props.selected ? "default" : "outline"}
      aria-pressed={props.selected}
      onClick={props.onSelect}
    >
      {props.label}
      {props.count === undefined ? null : (
        <span className="font-sans text-[11px] font-bold opacity-85">
          {props.count}
        </span>
      )}
    </Button>
  )
}

export function AuctioneerSidebar(props: AuctioneerSidebarProps) {
  const t = useTranslations("pages./auctioneer")
  const [query, setQuery] = useState("")
  const status = props.status
  const debouncedQuery = useDebounce(query, searchDebounceMs)
  //* Without a status: feeds the counts, and is the list itself under "all"
  const allLots = useIndexPrivateLots({ q: debouncedQuery })
  const lots = allLots.data?.lots

  function countFor(filterStatus?: PrivateLotStatus) {
    if (!lots) {
      return undefined
    }

    if (!filterStatus) {
      return lots.length
    }

    return lots.filter((lot) => lot.status === filterStatus).length
  }

  function onQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  function onStatusToggle(nextStatus: PrivateLotStatus) {
    props.onStatusChange(status === nextStatus ? undefined : nextStatus)
  }

  const total = countFor()

  return (
    <aside
      id="auctioneer-sidebar"
      aria-labelledby="auctioneer-sidebar-title"
      className={cn(auctioneerPaneClassName, "shadow-hard-6", props.className)}
    >
      <AuctioneerPaneHeader
        titleId="auctioneer-sidebar-title"
        title={t("myLots")}
        aside={
          total === undefined ? null : (
            <span
              id="auctioneer-lots-total"
              className="text-[13px] font-bold text-brand-yellow"
            >
              {t("lotsCount", { count: total })}
            </span>
          )
        }
      />
      <div className="flex flex-col gap-3 border-b-3 border-line-soft p-3.5">
        <Label htmlFor="auctioneer-lot-search" className="sr-only">
          {t("lotSearchLabel")}
        </Label>
        <div className="flex">
          <span
            aria-hidden="true"
            className="flex w-11 shrink-0 items-center justify-center border-3 border-r-0 border-input bg-brand-ink text-brand-yellow"
          >
            <SearchIcon className="size-4.5" strokeWidth={3} />
          </span>
          <Input
            id="auctioneer-lot-search"
            type="search"
            value={query}
            placeholder={t("lotSearchPlaceholder")}
            className="h-11 px-3 py-2 text-[15px]"
            onChange={onQueryChange}
          />
        </div>
        <div
          id="auctioneer-lot-filters"
          role="group"
          aria-label={t("lotFiltersLabel")}
          className="flex flex-wrap gap-1.5"
        >
          <FilterButton
            id="auctioneer-lot-filter-ALL"
            label={t("lotFilterAll")}
            count={total}
            selected={status === undefined}
            onSelect={() => props.onStatusChange(undefined)}
          />
          {auctioneerLotFilters.map((filterStatus) => (
            <FilterButton
              key={filterStatus}
              id={`auctioneer-lot-filter-${filterStatus}`}
              label={t(`statuses.${auctioneerLotStatusLabelKey[filterStatus]}`)}
              count={countFor(filterStatus)}
              selected={status === filterStatus}
              onSelect={() => onStatusToggle(filterStatus)}
            />
          ))}
        </div>
      </div>
      <LotDraftItem
        editing={props.selectedLotId === null}
        onOpenDraft={props.onOpenDraft}
      />
      <AuctioneerLotList
        query={debouncedQuery}
        status={status}
        selectedLotId={props.selectedLotId}
        newLotId={props.newLotId}
        onSelectLot={props.onSelectLot}
      />
    </aside>
  )
}
