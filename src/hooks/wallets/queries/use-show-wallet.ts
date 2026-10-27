"use client"

//* Libraries imports
import { useQuery } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { walletSchema } from "@/src/schemas/wallet"

//* Local imports
import { ApiError, ApiSchemaError, api } from "@/src/lib/api"
import { QUERY_KEYS } from "@/src/lib/query-client"

const showWalletSchema = z.object({
  ...walletSchema.pick({
    totalBalance: true,
    committedBalance: true,
    availableBalance: true,
  }).shape,
})

export type ShowWallet = z.infer<typeof showWalletSchema>

export interface ShowWalletInput {
  enabled?: boolean
}

async function showWallet() {
  return api.get({
    url: "/private/wallet",
    schema: showWalletSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useShowWallet(props: ShowWalletInput = {}) {
  const enabled = props.enabled ?? true

  return useQuery({
    queryKey: [QUERY_KEYS.WALLETS.SINGLE],
    queryFn: showWallet,
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
