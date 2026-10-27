"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { lotSchema } from "@/src/schemas/lot"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const lotAuditStatusSchema = z.enum([
  "INTACT",
  "TAMPERED",
  "VERIFICATION_FAILED",
])

const lotAuditBidSchema = z.object({
  sequence: z.number().int().positive(),
  amount: lotSchema.shape.openingBid,
  createdAt: lotSchema.shape.startsAt,
  participantNo: z.number().int().positive(),
})

const lotAuditSchema = z.object({
  lotId: z.uuid(),
  status: lotAuditStatusSchema,
  bids: z.array(lotAuditBidSchema),
})

const apiResponseSchema = z.object({
  audit: lotAuditSchema,
})

export type ShowLotAudit = z.infer<typeof apiResponseSchema>

export interface ShowLotAuditInput {
  id: string
  enabled?: boolean
}

async function showLotAudit(id: string) {
  return api.get({
    url: `/public/lots/${id}/audit`,
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useShowLotAudit(props: ShowLotAuditInput) {
  const idIsUuid = z.uuid().safeParse(props.id).success
  const enabled = (props.enabled ?? true) && idIsUuid

  return useQuery({
    queryKey: [QUERY_KEYS.LOTS.ALL, QUERY_KEYS.LOTS.AUDIT, props.id],
    queryFn: () => showLotAudit(props.id),
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
