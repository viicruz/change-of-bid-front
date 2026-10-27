"use client"

//* Libraries imports
import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import {
  mergePublicLotRead,
  publicLotQueryKey,
} from "@/src/lib/lots/public-lot-room"
import { publicLotLiveMessageSchema } from "@/src/hooks/lots/queries/use-public-lot-live"

const apiResponseSchema = z.object({
  ...publicLotLiveMessageSchema.shape,
  viewerParticipantNo: z.number().int().positive().nullable(),
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
  const queryClient = useQueryClient()
  const idIsUuid = z.uuid().safeParse(props.id).success
  const enabled = (props.enabled ?? true) && idIsUuid

  return useQuery({
    queryKey: publicLotQueryKey(props.id),
    queryFn: async () => {
      const body = await showLot(props.id)
      const cached = queryClient.getQueryData<ShowLot>(
        publicLotQueryKey(props.id)
      )

      return mergePublicLotRead(cached, body)
    },
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
