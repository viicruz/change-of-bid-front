"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { isWithinMoneyLimit } from "@/src/schemas/common/money"
import { lotSchema } from "@/src/schemas/lot"

//* Local imports
import { api } from "@/src/lib/api"
import { QUERY_KEYS, queryInvalidator } from "@/src/lib/query-client"

const minimumLotDurationMs = 4 * 60 * 1000

const moneyInputSchema = z
  .string()
  .regex(/^(?:0\.(?:0[1-9]|[1-9]\d?)|[1-9]\d*(?:\.\d{1,2})?)$/, {
    error: "INVALID_MONEY",
    abort: true,
  })
  .refine(isWithinMoneyLimit, "MONEY_ABOVE_LIMIT")

export const storeLotSchema = z
  .object({
    title: z.string().trim().min(1, "TITLE_REQUIRED"),
    description: z.string().trim().nullable().optional(),
    openingBid: moneyInputSchema,
    minIncrement: moneyInputSchema,
    startsAt: z.iso.datetime({ offset: true, error: "INVALID_DATETIME" }),
    endsAt: z.iso.datetime({ offset: true, error: "INVALID_DATETIME" }),
    cardIds: z
      .array(z.number().int("CARD_IDS_REQUIRED").positive("CARD_IDS_REQUIRED"))
      .min(1, "CARD_IDS_REQUIRED"),
  })
  .superRefine((values, context) => {
    const startsAt = Date.parse(values.startsAt)
    const endsAt = Date.parse(values.endsAt)

    if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
      return
    }

    const endsInTheFuture = endsAt > Date.now()
    const lastsLongEnough = endsAt - startsAt >= minimumLotDurationMs

    if (endsInTheFuture && lastsLongEnough) {
      return
    }

    context.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "INVALID_SCHEDULE",
    })
  })

export type StoreLot = z.infer<typeof storeLotSchema>

function normalizeDescription(description: string | null | undefined) {
  if (typeof description !== "string") {
    return null
  }

  const trimmed = description.trim()

  if (trimmed.length === 0) {
    return null
  }

  return trimmed
}

async function storeLot(input: StoreLot) {
  const parsed = storeLotSchema.parse(input)

  return api.post({
    url: "/private/lots",
    body: {
      title: parsed.title,
      description: normalizeDescription(parsed.description),
      openingBid: parsed.openingBid,
      minIncrement: parsed.minIncrement,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt,
      cardIds: parsed.cardIds,
    },
    schema: lotSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useStoreLot() {
  return useMutation({
    mutationFn: storeLot,
    retry: false,
    onSuccess: async () => {
      await queryInvalidator([[QUERY_KEYS.LOTS.ALL]])
    },
  })
}
