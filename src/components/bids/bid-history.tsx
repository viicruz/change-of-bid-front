"use client"

//* Libraries imports
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useState, type ChangeEvent, type MouseEvent } from "react"

//* Components imports
import { BidCard } from "@/src/components/bids/bid-card"
import { BidSummary } from "@/src/components/bids/bid-summary"
import { Button, buttonVariants } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import Pagination from "@/src/components/ui/pagination"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useIndexParticipations,
  type IndexParticipation,
} from "@/src/hooks/participations/queries/use-index-participations"

//* Lib imports
import {
  getPaginationPageItems,
  type PaginationPageItem,
} from "@/src/lib/pagination"

const loadingSkeletonCount = 3
const bidHistoryPageSize = 5

const bidFilters = ["LIVE", "SCHEDULED", "ENDED", "CANCELED", "won"] as const

type BidHistoryFilter = (typeof bidFilters)[number]

//* Error boxes share the hard-edged look of the rest of the app
const errorBox =
  "flex w-full flex-col items-start gap-3 border-4 border-border bg-card p-[22px] font-semibold text-red-text shadow-hard-8 shadow-brand-red"

const emptyBox =
  "flex flex-col items-center gap-4 border-4 border-border bg-card p-7 text-center shadow-hard-8"

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
  const filtersKey = `${query}\0${filter ?? ""}`
  const [pageState, setPageState] = useState({
    filtersKey,
    page: 1,
  })
  const page = pageState.filtersKey === filtersKey ? pageState.page : 1
  const participations = participationsQuery.data?.lots ?? []
  //* Counts follow the search, so each filter tells how many rows it would leave
  const searchedParticipations = participations.filter((participation) => {
    return matchesQuery(participation, query)
  })
  const visibleParticipations = searchedParticipations.filter((participation) =>
    matchesFilter(participation, filter)
  )
  const pageCount = Math.max(
    1,
    Math.ceil(visibleParticipations.length / bidHistoryPageSize)
  )
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * bidHistoryPageSize
  const pageParticipations = visibleParticipations.slice(
    pageStart,
    pageStart + bidHistoryPageSize
  )
  const showPagination = visibleParticipations.length > bidHistoryPageSize

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

  function onClearFilters() {
    setQuery("")
    setFilter(null)
  }

  function onPageChange(nextPage: number) {
    if (nextPage === currentPage || nextPage < 1 || nextPage > pageCount) {
      return
    }

    setPageState({
      filtersKey,
      page: nextPage,
    })
  }

  return (
    <div className="flex flex-col gap-12">
      {participationsQuery.isError ? null : (
        <BidSummary
          isPending={participationsQuery.isPending}
          participations={participations}
        />
      )}
      <section
        className="flex min-w-0 flex-col gap-[18px]"
        aria-labelledby="bid-history-title"
      >
        <h2 id="bid-history-title" className="type-h2">
          {t("historyTitle")}
        </h2>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex w-full max-w-103 flex-col gap-2">
            <Label htmlFor="bid-search">{t("searchLabel")}</Label>
            <Input
              id="bid-search"
              type="search"
              value={query}
              placeholder={t("searchPlaceholder")}
              onChange={onQueryChange}
            />
          </div>
          <div
            id="bid-filters"
            role="group"
            aria-label={t("filtersLabel")}
            className="flex flex-wrap gap-2"
          >
            {bidFilters.map((bidFilter) => {
              const selected = filter === bidFilter
              const count = searchedParticipations.filter((participation) =>
                matchesFilter(participation, bidFilter)
              ).length

              return (
                <Button
                  key={bidFilter}
                  id={`bid-filter-${bidFilter}`}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  onClick={() => onFilterToggle(bidFilter)}
                >
                  {t(`filters.${bidFilter}`)}
                  {participationsQuery.isSuccess ? (
                    <span className="tabular-nums opacity-70">{count}</span>
                  ) : null}
                </Button>
              )
            })}
          </div>
        </div>
        <BidHistoryResults
          query={participationsQuery}
          participationCount={participations.length}
          visibleCount={visibleParticipations.length}
          pageParticipations={pageParticipations}
          showPagination={showPagination}
          page={currentPage}
          pageCount={pageCount}
          onPageChange={onPageChange}
          onClearFilters={onClearFilters}
        />
      </section>
    </div>
  )
}

type BidHistoryResultsProps = {
  query: ReturnType<typeof useIndexParticipations>
  participationCount: number
  visibleCount: number
  pageParticipations: IndexParticipation[]
  showPagination: boolean
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  onClearFilters: () => void
}

function BidHistoryResults(props: BidHistoryResultsProps) {
  const t = useTranslations("pages./my-bids")

  if (props.query.isError) {
    return (
      <div className={errorBox} role="alert">
        <p id="bid-history-error">{t("error")}</p>
        <Button
          id="bid-history-retry"
          type="button"
          variant="outline"
          size="sm"
          disabled={props.query.isFetching}
          onClick={() => props.query.refetch()}
        >
          {props.query.isFetching ? t("retrying") : t("retry")}
        </Button>
      </div>
    )
  }

  if (props.query.isPending) {
    return (
      <>
        <p className="sr-only">{t("loading")}</p>
        <ul
          aria-labelledby="bid-history-title"
          aria-busy="true"
          className="flex flex-col gap-6"
        >
          {Array.from({ length: loadingSkeletonCount }, (_, index) => (
            <li key={`bid-history-skeleton-${index}`}>
              <Skeleton className="h-40 w-full rounded-none border-4 border-black/20" />
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (props.participationCount === 0) {
    return (
      <div className={emptyBox}>
        <p
          id="bid-history-empty"
          className="font-semibold text-muted-foreground"
        >
          {t("empty")}
        </p>
        <Link
          id="bid-history-empty-cta"
          href="/#live"
          className={buttonVariants({ size: "sm" })}
        >
          {t("emptyCta")}
          <ArrowRightIcon
            aria-hidden="true"
            strokeWidth={3}
            strokeLinecap="square"
          />
        </Link>
      </div>
    )
  }

  if (props.visibleCount === 0) {
    return (
      <div className={emptyBox}>
        <p
          id="bid-history-empty-filtered"
          className="font-semibold text-muted-foreground"
        >
          {t("emptyFiltered")}
        </p>
        <Button
          id="bid-history-clear-filters"
          type="button"
          variant="outline"
          size="sm"
          onClick={props.onClearFilters}
        >
          {t("clearFilters")}
        </Button>
      </div>
    )
  }

  return (
    <>
      <ul id="bid-history" className="flex flex-col gap-6">
        {props.pageParticipations.map((participation) => (
          <li key={participation.id} id={`bid-${participation.id}`}>
            <BidCard participation={participation} />
          </li>
        ))}
      </ul>
      {props.showPagination ? (
        <BidHistoryPagination
          page={props.page}
          pageCount={props.pageCount}
          onPageChange={props.onPageChange}
        />
      ) : null}
    </>
  )
}

type BidHistoryPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function paginationEntryKey(
  item: PaginationPageItem,
  previousItem: PaginationPageItem | undefined
) {
  if (item !== "ellipsis") {
    return String(item)
  }

  if (previousItem === 1) {
    return "ellipsis-after-first"
  }

  return "ellipsis-before-last"
}

function getPaginationEntries(page: number, pageCount: number) {
  const items = getPaginationPageItems(page, pageCount)
  let previousItem: PaginationPageItem | undefined

  return items.map((item) => {
    const key = paginationEntryKey(item, previousItem)

    previousItem = item

    return {
      item,
      key,
    }
  })
}

function BidHistoryPagination(props: BidHistoryPaginationProps) {
  const t = useTranslations("pages./my-bids")
  const entries = getPaginationEntries(props.page, props.pageCount)

  function onPrevious() {
    props.onPageChange(props.page - 1)
  }

  function onNext() {
    props.onPageChange(props.page + 1)
  }

  function onPageClick(event: MouseEvent<HTMLButtonElement>) {
    const nextPage = Number(event.currentTarget.dataset.page)

    if (!Number.isInteger(nextPage)) {
      return
    }

    props.onPageChange(nextPage)
  }

  return (
    <Pagination.Root
      id="bid-history-pagination"
      aria-label={t("pagination")}
      className="pt-4"
    >
      <Pagination.Content className="flex-wrap justify-center">
        <Pagination.Item>
          <Pagination.Previous
            id="bid-history-previous"
            type="button"
            size="icon"
            text={t("previous")}
            aria-label={t("previous")}
            disabled={props.page <= 1}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onPrevious}
          />
        </Pagination.Item>
        {entries.map((entry) => {
          if (entry.item === "ellipsis") {
            return (
              <Pagination.Item key={entry.key}>
                <Pagination.Ellipsis label={t("morePages")} />
              </Pagination.Item>
            )
          }

          return (
            <Pagination.Item key={entry.key}>
              <Pagination.Link
                id={`bid-history-page-${entry.item}`}
                type="button"
                isActive={entry.item === props.page}
                data-page={entry.item}
                aria-label={
                  entry.item === props.page
                    ? t("currentPage", { page: String(entry.item) })
                    : t("goToPage", { page: String(entry.item) })
                }
                onClick={onPageClick}
              >
                {entry.item}
              </Pagination.Link>
            </Pagination.Item>
          )
        })}
        <Pagination.Item>
          <Pagination.Next
            id="bid-history-next"
            type="button"
            size="icon"
            text={t("next")}
            aria-label={t("next")}
            disabled={props.page >= props.pageCount}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onNext}
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
