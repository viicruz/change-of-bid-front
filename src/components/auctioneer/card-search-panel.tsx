"use client"

//* Libraries imports
import { cn } from "cn"
import { useTranslations } from "next-intl"
import {
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from "react"

//* Components imports
import { CardSearchResult } from "@/src/components/auctioneer/card-search-result"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import Pagination from "@/src/components/ui/pagination"
import Popover from "@/src/components/ui/popover"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useIndexCards,
  type CardSearchFilters,
} from "@/src/hooks/cards/queries/use-index-cards"
import { useDebounce } from "@/src/hooks/use-debounce"

//* Schema imports
import {
  cardAttributeArray,
  cardSortArray,
  numericComparisonOperatorArray,
  type CardAttribute,
  type CardSort,
  type NumericComparison,
  type NumericComparisonOperator,
} from "@/src/schemas/card"

//* Lib imports
import type { AuctioneerCard } from "@/src/lib/cards/auctioneer-card"
import {
  cardSearchPageSize,
  getCardSearchPageCount,
  getCardSearchPageItems,
} from "@/src/lib/cards/card-search-pages"
import {
  cardSearchTypes,
  isCardSearchType,
} from "@/src/lib/cards/card-search-types"
import { toAuctioneerCard } from "@/src/lib/cards/to-auctioneer-card"

const searchDebounceMs = 300
const loadingSkeletonCount = cardSearchPageSize
const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type CardSearchPanelProps = {
  idPrefix?: string
  framed?: boolean
}

type CardSearchDraft = {
  fname: string
  type: string
  attribute: string
  archetype: string
  levelOperator: string
  levelValue: string
  sort: string
}

type SearchSelectProps = {
  id: string
  label: string
  value: string
  emptyLabel: string
  onValueChange: (value: string) => void
  children: ReactNode
}

function SearchSelect(props: SearchSelectProps) {
  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    props.onValueChange(event.currentTarget.value)
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <select
        id={props.id}
        className={selectClassName}
        value={props.value}
        onChange={onChange}
      >
        <option value="">{props.emptyLabel}</option>
        {props.children}
      </select>
    </div>
  )
}

export function CardSearchPanel(props: CardSearchPanelProps) {
  const t = useTranslations("pages./auctioneer")
  const idPrefix = props.idPrefix ?? ""
  const framed = props.framed ?? true
  const titleId = `${idPrefix}card-search-title`
  const [fname, setFname] = useState("")
  const [cardType, setCardType] = useState("")
  const [attribute, setAttribute] = useState("")
  const [archetype, setArchetype] = useState("")
  const [levelOperator, setLevelOperator] = useState("")
  const [levelValue, setLevelValue] = useState("")
  const [sort, setSort] = useState("")
  const debouncedFname = useDebounce(fname, searchDebounceMs)
  const debouncedArchetype = useDebounce(archetype, searchDebounceMs)
  const debouncedLevelValue = useDebounce(levelValue, searchDebounceMs)
  const filters = toCardSearchFilters({
    fname: debouncedFname.trim(),
    type: cardType,
    attribute,
    archetype: debouncedArchetype.trim(),
    levelOperator,
    levelValue: debouncedLevelValue.trim(),
    sort,
  })
  const filtersKey = JSON.stringify(filters)
  const [pageState, setPageState] = useState({
    filtersKey,
    page: 0,
  })
  const page = pageState.filtersKey === filtersKey ? pageState.page : 0
  const resultsRef = useRef<HTMLDivElement>(null)
  const hasFilters = Object.keys(filters).length > 0
  const cardsQuery = useIndexCards({
    filters,
    pagination: {
      num: cardSearchPageSize,
      offset: page * cardSearchPageSize,
    },
  })
  const totalRows = cardsQuery.data?.meta?.total_rows ?? 0
  const pageCount = getCardSearchPageCount(totalRows, cardSearchPageSize)

  function onPageChange(nextPage: number) {
    if (nextPage === page || nextPage < 0 || nextPage >= pageCount) {
      return
    }

    setPageState({
      filtersKey,
      page: nextPage,
    })
    resultsRef.current?.scrollTo({ top: 0 })
  }

  function onFnameChange(event: ChangeEvent<HTMLInputElement>) {
    setFname(event.currentTarget.value)
  }

  function onArchetypeChange(event: ChangeEvent<HTMLInputElement>) {
    setArchetype(event.currentTarget.value)
  }

  function onLevelOperatorChange(event: ChangeEvent<HTMLSelectElement>) {
    setLevelOperator(event.currentTarget.value)
  }

  function onLevelValueChange(event: ChangeEvent<HTMLInputElement>) {
    setLevelValue(event.currentTarget.value)
  }

  const fields = (
    <>
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}card-search`}>
            {t("cardSearchLabel")}
          </Label>
          <Input
            id={`${idPrefix}card-search`}
            type="search"
            value={fname}
            placeholder={t("cardSearchPlaceholder")}
            onChange={onFnameChange}
          />
        </div>
        <Popover.Root>
          <Popover.Trigger
            render={
              <Button
                id={`${idPrefix}card-search-filters-trigger`}
                type="button"
                variant="outline"
                className="w-full"
              />
            }
          >
            {t("cardFiltersLabel")}
          </Popover.Trigger>
          <Popover.Content align="start" className="w-80">
            <div
              id={`${idPrefix}card-search-filters`}
              role="group"
              aria-label={t("cardFiltersLabel")}
              className="flex flex-col gap-2"
            >
              <SearchSelect
                id={`${idPrefix}card-search-type`}
                label={t("cardTypeLabel")}
                value={cardType}
                emptyLabel={t("cardFilterAny")}
                onValueChange={setCardType}
              >
                {cardSearchTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {t(`cardSearchTypes.${type.messageKey}`)}
                  </option>
                ))}
              </SearchSelect>
              <SearchSelect
                id={`${idPrefix}card-search-attribute`}
                label={t("cardAttributeLabel")}
                value={attribute}
                emptyLabel={t("cardFilterAny")}
                onValueChange={setAttribute}
              >
                {cardAttributeArray.map((cardAttribute) => (
                  <option key={cardAttribute} value={cardAttribute}>
                    {t(`cardAttributes.${cardAttribute}`)}
                  </option>
                ))}
              </SearchSelect>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${idPrefix}card-search-archetype`}>
                  {t("cardArchetypeLabel")}
                </Label>
                <Input
                  id={`${idPrefix}card-search-archetype`}
                  type="search"
                  value={archetype}
                  placeholder={t("cardArchetypePlaceholder")}
                  onChange={onArchetypeChange}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Label htmlFor={`${idPrefix}card-search-level-operator`}>
                    {t("cardLevelOperatorLabel")}
                  </Label>
                  <select
                    id={`${idPrefix}card-search-level-operator`}
                    className={selectClassName}
                    value={levelOperator}
                    onChange={onLevelOperatorChange}
                  >
                    <option value="">{t("cardFilterAny")}</option>
                    {numericComparisonOperatorArray.map((operator) => (
                      <option key={operator} value={operator}>
                        {t(`cardLevelOperators.${operator}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex w-24 flex-col gap-2">
                  <Label htmlFor={`${idPrefix}card-search-level`}>
                    {t("cardLevelValueLabel")}
                  </Label>
                  <Input
                    id={`${idPrefix}card-search-level`}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={levelValue}
                    onChange={onLevelValueChange}
                  />
                </div>
              </div>
              <SearchSelect
                id={`${idPrefix}card-search-sort`}
                label={t("cardSortLabel")}
                value={sort}
                emptyLabel={t("cardFilterAny")}
                onValueChange={setSort}
              >
                {cardSortArray.map((cardSort) => (
                  <option key={cardSort} value={cardSort}>
                    {t(`cardSorts.${cardSort}`)}
                  </option>
                ))}
              </SearchSelect>
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
      <div ref={resultsRef} className="min-h-0 flex-1 overflow-y-auto p-px">
        <CardSearchResults
          idPrefix={idPrefix}
          titleId={titleId}
          hasFilters={hasFilters}
          isError={cardsQuery.isError}
          isStale={cardsQuery.isPlaceholderData}
          hasResults={cardsQuery.data !== undefined}
          cards={cardsQuery.data?.data.map(toAuctioneerCard) ?? []}
        />
      </div>
      {hasFilters && !cardsQuery.isError && pageCount > 1 ? (
        <CardSearchPagination
          idPrefix={idPrefix}
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      ) : null}
    </>
  )

  if (!framed) {
    return (
      <div
        id={`${idPrefix}card-search-panel`}
        className="flex h-full max-h-160 min-h-0 flex-col gap-4"
      >
        {fields}
      </div>
    )
  }

  return (
    <Card.Root
      id={`${idPrefix}card-search-panel`}
      className="h-full max-h-160 min-h-0"
    >
      <Card.Header className="shrink-0">
        <Card.Title>
          <h2 id={titleId} className="text-center">
            {t("cardSearchTitle")}
          </h2>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex min-h-0 flex-1 flex-col gap-4">
        {fields}
      </Card.Content>
    </Card.Root>
  )
}

type CardSearchResultsProps = {
  idPrefix: string
  titleId: string
  hasFilters: boolean
  isError: boolean
  isStale: boolean
  hasResults: boolean
  cards: AuctioneerCard[]
}

type CardSearchPaginationProps = {
  idPrefix: string
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function CardSearchPagination(props: CardSearchPaginationProps) {
  const t = useTranslations("pages./auctioneer")
  const currentPage = props.page + 1
  const items = getCardSearchPageItems(currentPage, props.pageCount)

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
      id={`${props.idPrefix}card-search-pagination`}
      aria-label={t("cardSearchPagination")}
      className="shrink-0"
    >
      <Pagination.Content className="flex-wrap justify-center">
        <Pagination.Item>
          <Pagination.Previous
            id={`${props.idPrefix}card-search-previous`}
            type="button"
            size="icon"
            text={t("cardSearchPrevious")}
            aria-label={t("cardSearchPrevious")}
            disabled={props.page === 0}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onPrevious}
          />
        </Pagination.Item>
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <Pagination.Item key={`${props.idPrefix}ellipsis-${index}`}>
                <Pagination.Ellipsis label={t("cardSearchMorePages")} />
              </Pagination.Item>
            )
          }

          const pageIndex = item - 1

          return (
            <Pagination.Item key={item}>
              <Pagination.Link
                id={`${props.idPrefix}card-search-page-${item}`}
                type="button"
                isActive={pageIndex === props.page}
                data-page={pageIndex}
                aria-label={
                  pageIndex === props.page
                    ? t("cardSearchCurrentPage", { page: String(item) })
                    : t("cardSearchGoToPage", { page: String(item) })
                }
                onClick={onPageClick}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          )
        })}
        <Pagination.Item>
          <Pagination.Next
            id={`${props.idPrefix}card-search-next`}
            type="button"
            size="icon"
            text={t("cardSearchNext")}
            aria-label={t("cardSearchNext")}
            disabled={currentPage >= props.pageCount}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onNext}
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}

function CardSearchResults(props: CardSearchResultsProps) {
  const t = useTranslations("pages./auctioneer")

  if (!props.hasFilters) {
    return (
      <p
        id={`${props.idPrefix}card-search-status`}
        className="text-sm text-muted-foreground"
      >
        {t("cardSearchIdle")}
      </p>
    )
  }

  if (props.isError) {
    return (
      <p
        id={`${props.idPrefix}card-search-status`}
        className="text-sm text-destructive"
      >
        {t("cardSearchError")}
      </p>
    )
  }

  if (!props.hasResults) {
    return (
      <>
        <p className="sr-only">{t("cardSearchLoading")}</p>
        <ul
          id={`${props.idPrefix}card-search-results`}
          aria-labelledby={props.titleId}
          aria-busy="true"
          className="grid grid-cols-2 gap-3"
        >
          {Array.from({ length: loadingSkeletonCount }, (_, index) => (
            <li key={`${props.idPrefix}card-search-skeleton-${index}`}>
              <Skeleton className="aspect-3/4 w-full" />
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (props.cards.length === 0) {
    return (
      <p
        id={`${props.idPrefix}card-search-status`}
        className="text-sm text-muted-foreground"
      >
        {t("cardSearchEmpty")}
      </p>
    )
  }

  return (
    <ul
      id={`${props.idPrefix}card-search-results`}
      aria-labelledby={props.titleId}
      aria-busy={props.isStale}
      className={cn("grid grid-cols-2 gap-3", props.isStale && "opacity-70")}
    >
      {props.cards.map((card) => (
        <li key={card.id}>
          <CardSearchResult idPrefix={props.idPrefix} card={card} />
        </li>
      ))}
    </ul>
  )
}

function toCardSearchFilters(draft: CardSearchDraft): CardSearchFilters {
  const filters: CardSearchFilters = {}

  if (draft.fname.length > 0) {
    filters.fname = draft.fname
  }

  if (isCardSearchType(draft.type)) {
    filters.type = draft.type
  }

  if (isCardAttribute(draft.attribute)) {
    filters.attribute = draft.attribute
  }

  if (draft.archetype.length > 0) {
    filters.archetype = draft.archetype
  }

  const level = toLevelComparison(draft.levelOperator, draft.levelValue)

  if (level) {
    filters.level = level
  }

  if (isCardSort(draft.sort)) {
    filters.sort = draft.sort
  }

  return filters
}

function toLevelComparison(
  operator: string,
  value: string
): NumericComparison | undefined {
  if (!isNumericComparisonOperator(operator) || !/^\d+$/.test(value)) {
    return undefined
  }

  return {
    operator,
    value: Number(value),
  }
}

function isCardAttribute(value: string): value is CardAttribute {
  return cardAttributeArray.some((attribute) => attribute === value)
}

function isCardSort(value: string): value is CardSort {
  return cardSortArray.some((sort) => sort === value)
}

function isNumericComparisonOperator(
  value: string
): value is NumericComparisonOperator {
  return numericComparisonOperatorArray.some((operator) => operator === value)
}
