"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { lotSchema } from "@/src/schemas/lot"

//* Local imports
import { api } from "@/src/lib/api"
import { QUERY_KEYS, queryInvalidator } from "@/src/lib/query-client"

const bidAmountSchema = z
  .string("INVALID_MONEY")
  .trim()
  .regex(/^(?:0\.(?:0[1-9]|[1-9]\d?)|[1-9]\d*(?:\.\d{1,2})?)$/, "INVALID_MONEY")

export const storeBidSchema = z.object({
  id: lotSchema.shape.id,
  amount: bidAmountSchema,
})

export type StoreBid = z.infer<typeof storeBidSchema>

const storedBidSchema = z.object({
  id: z.uuid(),
  sequence: z.number().int().positive(),
  amount: lotSchema.shape.openingBid,
  createdAt: lotSchema.shape.startsAt,
  participantNo: z.number().int().positive(),
  endsAt: lotSchema.shape.endsAt,
  extensionCount: z.number().int().nonnegative(),
})

export type StoredBid = z.infer<typeof storedBidSchema>

async function storeBid(input: StoreBid) {
  const parsed = storeBidSchema.parse(input)

  return api.post({
    url: `/private/lots/${parsed.id}/bids`,
    body: {
      amount: parsed.amount,
    },
    schema: storedBidSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useStoreBid() {
  return useMutation({
    mutationFn: storeBid,
    retry: false,
    onSuccess: async () => {
      await queryInvalidator([
        [QUERY_KEYS.LOTS.ALL],
        [QUERY_KEYS.WALLETS.SINGLE],
        [QUERY_KEYS.WALLETS.ALL, QUERY_KEYS.WALLETS.MOVEMENTS],
      ])
    },
  })
}
