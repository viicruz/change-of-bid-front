"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { lotItemSchema, lotSchema } from "@/src/schemas/lot"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const shareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

const receiptItemSchema = lotItemSchema.extend({
  cardSnapshot: z.record(z.string(), z.unknown()),
})

const receiptSchema = z.object({
  lotId: z.uuid(),
  title: lotSchema.shape.title,
  description: lotSchema.shape.description,
  endedAt: lotSchema.shape.endsAt,
  finalAmount: lotSchema.shape.openingBid,
  winnerParticipantNo: z.number().int().positive(),
  items: z.array(receiptItemSchema),
})

const apiResponseSchema = z.object({
  receipt: receiptSchema,
})

export type ShowReceipt = z.infer<typeof apiResponseSchema>

export interface ShowReceiptInput {
  shareToken: string
  enabled?: boolean
}

async function showReceipt(shareToken: string) {
  return api.get({
    url: `/public/receipts/${shareToken}`,
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useShowReceipt(props: ShowReceiptInput) {
  const shareTokenIsValid = shareTokenSchema.safeParse(props.shareToken).success
  const enabled = (props.enabled ?? true) && shareTokenIsValid

  return useQuery({
    queryKey: [
      QUERY_KEYS.RECEIPTS.ALL,
      QUERY_KEYS.RECEIPTS.SINGLE,
      props.shareToken,
    ],
    queryFn: () => showReceipt(props.shareToken),
    enabled,
    staleTime: 1000 * 60 * 60,
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
