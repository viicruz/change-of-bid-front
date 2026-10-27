"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import {
  lotItemSchema,
  lotSchema,
  privateLotStatusSchema,
} from "@/src/schemas/lot"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const showLotItemSchema = lotItemSchema.extend({
  cardSnapshot: z.record(z.string(), z.unknown()),
})

const showLotBidSchema = z.object({
  sequence: z.number().int().positive(),
  amount: lotSchema.shape.openingBid,
  createdAt: lotSchema.shape.startsAt,
  participantNo: z.number().int().positive(),
})

const showLotSchema = z.object({
  ...lotSchema.pick({
    id: true,
    title: true,
    description: true,
    openingBid: true,
    minIncrement: true,
    startsAt: true,
    endsAt: true,
  }).shape,
  extensionCount: z.number().int().nonnegative(),
  status: privateLotStatusSchema,
  currentBid: lotSchema.shape.openingBid.nullable(),
  leaderParticipantNo: z.number().int().positive().nullable(),
  bidCount: z.number().int().nonnegative(),
  sold: z.boolean(),
  winnerParticipantNo: z.number().int().positive().nullable(),
  items: z.array(showLotItemSchema),
  bids: z.array(showLotBidSchema),
})

const apiResponseSchema = z.object({
  serverNow: lotSchema.shape.startsAt,
  viewerParticipantNo: z.number().int().positive().nullable(),
  lot: showLotSchema,
})

export type ShowLot = z.infer<typeof apiResponseSchema>

export interface ShowLotInput {
  id: string
  enabled?: boolean
}

async function showLot(id: string) {
  return api.get({
    url: `/public/lots/${id}`,
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useShowLot(props: ShowLotInput) {
  const idIsUuid = z.uuid().safeParse(props.id).success
  const enabled = (props.enabled ?? true) && idIsUuid

  return useQuery({
    queryKey: [QUERY_KEYS.LOTS.ALL, QUERY_KEYS.LOTS.SINGLE, props.id],
    queryFn: () => showLot(props.id),
    enabled,
    staleTime: 0,
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
