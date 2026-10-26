"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import {
  type CardAttribute,
  type CardBanlist,
  type CardDateRegion,
  type CardFormat,
  type CardLanguage,
  type CardLinkMarker,
  type CardSort,
  type NumericComparison,
  cardSchema,
} from "@/src/schemas/card"
import { apiResponseErrorSchema } from "@/src/schemas/common/api"

//* Local imports
import { ApiError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const EMPTY_CARD_SEARCH_MESSAGE =
  "No card matching your query was found in the database."

const cardSearchMetaSchema = z.object({
  generated: z.string().optional(),
  current_rows: z.number(),
  total_rows: z.number(),
  rows_remaining: z.number(),
  total_pages: z.number().optional(),
  pages_remaining: z.number().optional(),
  next_page: z.string().optional(),
  next_page_offset: z.number().optional(),
})

const cardSearchResponseSchema = z.object({
  data: z.array(cardSchema),
  meta: cardSearchMetaSchema.optional(),
})

export type CardSearchResponse = z.infer<typeof cardSearchResponseSchema>

type StringFilter = string | readonly string[]

/**
 * Search filters for GET /public/yugioh/cards/search.
 * link, scale, misc, staple, and has_effect are omitted:
 * a plain query string for those fields is rejected with 422.
 * Attack, defense, and level only accept a comparison object.
 */
export interface CardSearchFilterFields {
  fname?: string
  name?: StringFilter
  id?: readonly number[]
  type?: StringFilter
  race?: StringFilter
  attribute?: CardAttribute | readonly CardAttribute[]
  atk?: NumericComparison
  def?: NumericComparison
  level?: NumericComparison
  linkmarker?: CardLinkMarker | readonly CardLinkMarker[]
  cardset?: string
  archetype?: string
  banlist?: CardBanlist
  format?: CardFormat
  sort?: CardSort
  language?: CardLanguage
  startdate?: string
  enddate?: string
  dateregion?: CardDateRegion
}

export type CardSearchFilters =
  | (Omit<CardSearchFilterFields, "id"> & { id?: never })
  | (Omit<CardSearchFilterFields, "name"> & { name?: never })

export type CardSearchPagination = {
  num: number
  offset: number
}

export interface IndexCardsInput {
  filters?: CardSearchFilters
  pagination?: CardSearchPagination
  enabled?: boolean
}

export class CardSearchFiltersError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CardSearchFiltersError"
  }
}

function assignParam(
  params: Record<string, string>,
  key: string,
  value: string | undefined
) {
  if (value !== undefined && value.length > 0) {
    params[key] = value
  }
}

function encodeStringFilter(value: StringFilter) {
  const values = (typeof value === "string" ? [value] : [...value]).filter(
    (item) => item.length > 0
  )

  if (values.length === 0) {
    return undefined
  }

  if (values.some((item) => item.includes(","))) {
    return JSON.stringify(values)
  }

  return values.join(",")
}

function encodeIdFilter(ids: readonly number[]) {
  if (ids.length === 0) {
    return undefined
  }

  return JSON.stringify([...ids])
}

function encodeComparison(comparison: NumericComparison) {
  return JSON.stringify({
    operator: comparison.operator,
    value: comparison.value,
  })
}

function assignCount(
  params: Record<string, string>,
  key: string,
  value: number
) {
  if (!Number.isInteger(value) || value < 0) {
    throw new CardSearchFiltersError(`${key} must be a non-negative integer`)
  }

  params[key] = String(value)
}

export function buildCardSearchParams(
  filters: CardSearchFilterFields,
  pagination?: CardSearchPagination
) {
  if (filters.name !== undefined && filters.id !== undefined) {
    throw new CardSearchFiltersError("name and id cannot be used together")
  }

  const params: Record<string, string> = {}

  assignParam(params, "fname", filters.fname)
  assignParam(
    params,
    "name",
    filters.name === undefined ? undefined : encodeStringFilter(filters.name)
  )
  assignParam(
    params,
    "id",
    filters.id === undefined ? undefined : encodeIdFilter(filters.id)
  )
  assignParam(
    params,
    "type",
    filters.type === undefined ? undefined : encodeStringFilter(filters.type)
  )
  assignParam(
    params,
    "race",
    filters.race === undefined ? undefined : encodeStringFilter(filters.race)
  )
  assignParam(
    params,
    "attribute",
    filters.attribute === undefined
      ? undefined
      : encodeStringFilter(filters.attribute)
  )
  assignParam(
    params,
    "atk",
    filters.atk === undefined ? undefined : encodeComparison(filters.atk)
  )
  assignParam(
    params,
    "def",
    filters.def === undefined ? undefined : encodeComparison(filters.def)
  )
  assignParam(
    params,
    "level",
    filters.level === undefined ? undefined : encodeComparison(filters.level)
  )
  assignParam(
    params,
    "linkmarker",
    filters.linkmarker === undefined
      ? undefined
      : encodeStringFilter(filters.linkmarker)
  )
  assignParam(params, "cardset", filters.cardset)
  assignParam(params, "archetype", filters.archetype)
  assignParam(params, "banlist", filters.banlist)
  assignParam(params, "format", filters.format)
  assignParam(params, "sort", filters.sort)
  assignParam(params, "language", filters.language)
  assignParam(params, "startdate", filters.startdate)
  assignParam(params, "enddate", filters.enddate)
  assignParam(params, "dateregion", filters.dateregion)

  if (pagination) {
    assignCount(params, "num", pagination.num)
    assignCount(params, "offset", pagination.offset)
  }

  return params
}

function textKey(value: string | undefined) {
  if (!value) {
    return null
  }

  return value
}

function listKey(value: StringFilter | undefined) {
  if (value === undefined) {
    return null
  }

  const items = typeof value === "string" ? [value] : [...value]

  if (items.length === 0) {
    return null
  }

  return [...items].sort().join("\u0000")
}

function idKey(value: readonly number[] | undefined) {
  if (!value || value.length === 0) {
    return null
  }

  return [...value].sort((left, right) => left - right).join(",")
}

function comparisonKey(value: NumericComparison | undefined) {
  if (!value) {
    return null
  }

  return `${value.operator}:${value.value}`
}

export function cardSearchQueryKey(
  filters: CardSearchFilterFields,
  pagination?: CardSearchPagination
) {
  return [
    QUERY_KEYS.CARDS.ALL,
    textKey(filters.fname),
    listKey(filters.name),
    idKey(filters.id),
    listKey(filters.type),
    listKey(filters.race),
    listKey(filters.attribute),
    comparisonKey(filters.atk),
    comparisonKey(filters.def),
    comparisonKey(filters.level),
    listKey(filters.linkmarker),
    textKey(filters.cardset),
    textKey(filters.archetype),
    filters.banlist ?? null,
    filters.format ?? null,
    filters.sort ?? null,
    filters.language ?? null,
    textKey(filters.startdate),
    textKey(filters.enddate),
    filters.dateregion ?? null,
    pagination?.num ?? null,
    pagination?.offset ?? null,
  ]
}

export function shouldKeepCardSearchPage(
  previousKey: readonly unknown[],
  nextKey: readonly unknown[]
) {
  if (previousKey.length !== nextKey.length || nextKey.length === 0) {
    return false
  }

  return nextKey
    .slice(0, -1)
    .every((part, index) => part === previousKey[index])
}

function hasFilterValue(value: unknown) {
  if (typeof value === "string") {
    return value.length > 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return value !== undefined && value !== null
}

function hasCardSearchFilter(filters: CardSearchFilterFields) {
  return Object.values(filters).some((value) => hasFilterValue(value))
}

export function isEmptyCardSearchError(error: unknown) {
  return (
    error instanceof ApiError &&
    error.status === 500 &&
    error.message.startsWith(EMPTY_CARD_SEARCH_MESSAGE)
  )
}

async function indexCards(
  filters: CardSearchFilterFields,
  pagination?: CardSearchPagination
) {
  try {
    return await api.get({
      url: "/public/yugioh/cards/search",
      params: buildCardSearchParams(filters, pagination),
      schema: cardSearchResponseSchema,
      errorSchema: apiResponseErrorSchema,
    })
  } catch (error) {
    if (isEmptyCardSearchError(error)) {
      return { data: [] }
    }

    throw error
  }
}

export function useIndexCards(props: IndexCardsInput) {
  const filters = props.filters ?? {}
  const pagination = props.pagination
  const enabled = props.enabled ?? hasCardSearchFilter(filters)
  const queryKey = cardSearchQueryKey(filters, pagination)

  return useQuery({
    queryKey,
    queryFn: () => indexCards(filters, pagination),
    enabled,
    placeholderData: (previousData, previousQuery) => {
      if (
        !previousQuery ||
        !shouldKeepCardSearchPage(previousQuery.queryKey, queryKey)
      ) {
        return undefined
      }

      return previousData
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof CardSearchFiltersError) {
        return false
      }

      if (
        error instanceof ApiError &&
        (error.status === 422 || error.status === 500)
      ) {
        return false
      }

      return failureCount < 3
    },
  })
}
