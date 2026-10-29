"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { lotSchema, privateLotStatusSchema } from "@/src/schemas/lot"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const shareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

const indexParticipationSchema = z
  .object({
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
    participantNo: z.number().int().positive(),
    won: z.boolean(),
    shareToken: shareTokenSchema.nullable(),
  })
  .superRefine((participation, context) => {
    const hasShareToken = participation.shareToken !== null

    if (participation.won === hasShareToken) {
      return
    }

    context.addIssue({
      code: "custom",
      path: ["shareToken"],
      message: participation.won
        ? "Won participation is missing its receipt"
        : "Share token belongs only to the winner",
    })
  })

export type IndexParticipation = z.infer<typeof indexParticipationSchema>

const apiResponseSchema = z.object({
  lots: z.array(indexParticipationSchema),
})

export type IndexParticipations = z.infer<typeof apiResponseSchema>

export interface IndexParticipationsInput {
  enabled?: boolean
}

async function indexParticipations() {
  return api.get({
    url: "/private/participations",
    schema: apiResponseSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useIndexParticipations(props: IndexParticipationsInput = {}) {
  const enabled = props.enabled ?? true

  return useQuery({
    queryKey: [QUERY_KEYS.PARTICIPATIONS.ALL],
    queryFn: indexParticipations,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
