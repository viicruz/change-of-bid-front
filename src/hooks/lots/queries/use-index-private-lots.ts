"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import {
  lotSchema,
  privateLotStatusSchema,
  type PrivateLotStatus,
} from "@/src/schemas/lot"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const settledMoneySchema = z.string().regex(/^(?:0|[1-9]\d*)\.\d{2}$/)

const indexPrivateLotSchema = z.object({
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
  status: privateLotStatusSchema,
  currentBid: lotSchema.shape.openingBid.nullable(),
  bidCount: z.number().int().nonnegative(),
  sold: z.boolean(),
  receivedAmount: settledMoneySchema.nullable(),
})

export type IndexPrivateLot = z.infer<typeof indexPrivateLotSchema>

const apiResponseSchema = z.object({
  totalReceived: settledMoneySchema,
  lots: z.array(indexPrivateLotSchema),
})

/** @expected-unused */
export type IndexPrivateLots = z.infer<typeof apiResponseSchema>

export interface IndexPrivateLotsInput {
  q?: string
  status?: PrivateLotStatus
  enabled?: boolean
}

function normalizeSearch(q: string | undefined) {
  const trimmed = q?.trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed
}

async function indexPrivateLots(
  q: string | undefined,
  status: PrivateLotStatus | undefined
) {
  const params: Record<string, string> = {}

  if (q !== undefined) {
    params.q = q
  }

  if (status !== undefined) {
    params.status = status
  }

  return api.get({
    url: "/private/lots",
    params,
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useIndexPrivateLots(props: IndexPrivateLotsInput = {}) {
  const q = normalizeSearch(props.q)
  const status = props.status
  const enabled = props.enabled ?? true

  return useQuery({
    queryKey: [
      QUERY_KEYS.LOTS.ALL,
      QUERY_KEYS.LOTS.PRIVATE,
      q ?? null,
      status ?? null,
    ],
    queryFn: () => indexPrivateLots(q, status),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof ApiSchemaError) {
        return false
      }

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
