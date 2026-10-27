"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import {
  lotSchema,
  publicLotStatusSchema,
  type PublicLotStatus,
} from "@/src/schemas/lot"

//* Local imports
import { ApiError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const indexLotSchema = z.object({
  ...lotSchema.pick({
    id: true,
    title: true,
    description: true,
    openingBid: true,
    minIncrement: true,
    startsAt: true,
    endsAt: true,
    items: true,
  }).shape,
  status: publicLotStatusSchema,
  currentBid: lotSchema.shape.openingBid.nullable(),
  bidCount: z.number().int().nonnegative(),
  sold: z.boolean(),
})

export type IndexLot = z.infer<typeof indexLotSchema>

const apiResponseSchema = z.object({
  lots: z.array(indexLotSchema),
})

export type IndexLots = z.infer<typeof apiResponseSchema>

export interface IndexLotsInput {
  q?: string
  status?: PublicLotStatus
  enabled?: boolean
}

function normalizeSearch(q: string | undefined) {
  const trimmed = q?.trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed
}

async function indexLots(
  q: string | undefined,
  status: PublicLotStatus | undefined
) {
  const params: Record<string, string> = {}

  if (q !== undefined) {
    params.q = q
  }

  if (status !== undefined) {
    params.status = status
  }

  return api.get({
    url: "/public/lots",
    params,
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useIndexLots(props: IndexLotsInput = {}) {
  const q = normalizeSearch(props.q)
  const status = props.status
  const enabled = props.enabled ?? true

  return useQuery({
    queryKey: [QUERY_KEYS.LOTS.ALL, q ?? null, status ?? null],
    queryFn: () => indexLots(q, status),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false
      }

      return failureCount < 3
    },
  })
}
