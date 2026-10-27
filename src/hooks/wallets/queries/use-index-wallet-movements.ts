"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { walletMovementsSchema } from "@/src/schemas/wallet"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

export type IndexWalletMovements = z.infer<typeof walletMovementsSchema>

export interface IndexWalletMovementsInput {
  page?: number
  limit?: number
  enabled?: boolean
}

async function indexWalletMovements(page: number, limit: number) {
  return api.get({
    url: "/private/wallet/movements",
    params: {
      page: String(page),
      limit: String(limit),
    },
    schema: walletMovementsSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useIndexWalletMovements(props: IndexWalletMovementsInput = {}) {
  const page = props.page ?? 1
  const limit = props.limit ?? 20
  const enabled = props.enabled ?? true

  return useQuery({
    queryKey: [
      QUERY_KEYS.WALLETS.ALL,
      QUERY_KEYS.WALLETS.MOVEMENTS,
      page,
      limit,
    ],
    queryFn: () => indexWalletMovements(page, limit),
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
