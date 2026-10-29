"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { lotSchema, privateLotStatusEnum } from "@/src/schemas/lot"

//* Local imports
import { api } from "@/src/lib/api"
import { QUERY_KEYS, queryInvalidator } from "@/src/lib/query-client"

const cancelLotSchema = z.object({
  id: lotSchema.shape.id,
})

/** @expected-unused */
export type CancelLotInput = z.infer<typeof cancelLotSchema>

const canceledLotSchema = z.object({
  id: lotSchema.shape.id,
  status: z.literal(privateLotStatusEnum.CANCELED),
  canceledAt: lotSchema.shape.startsAt,
})

export type CanceledLot = z.infer<typeof canceledLotSchema>

async function cancelLot(input: CancelLotInput) {
  const parsed = cancelLotSchema.parse(input)

  return api.post({
    url: `/private/lots/${parsed.id}/cancel`,
    schema: canceledLotSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useCancelLot() {
  return useMutation({
    mutationFn: cancelLot,
    retry: false,
    onSuccess: async () => {
      await queryInvalidator([[QUERY_KEYS.LOTS.ALL]])
    },
  })
}
