"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"
import * as z from "zod"

//* Schema imports
import { apiResponseErrorSchema } from "@/src/schemas/common/api"
import { walletSchema } from "@/src/schemas/wallet"

//* Local imports
import { api } from "@/src/lib/api"
import {
  QUERY_KEYS,
  queryClient,
  queryInvalidator,
} from "@/src/lib/query-client"

const depositAmountSchema = z
  .string("INVALID_MONEY")
  .trim()
  .regex(
    /^(?:0\.(?:0[1-9]|[1-9]\d?)|[1-9]\d{0,15}(?:\.\d{1,2})?)$/,
    "INVALID_MONEY"
  )

export const storeDepositSchema = z.object({
  amount: depositAmountSchema,
})

export type StoreDeposit = z.infer<typeof storeDepositSchema>

async function storeDeposit(input: StoreDeposit) {
  const parsed = storeDepositSchema.parse(input)

  return api.post({
    url: "/private/wallet/deposits",
    body: {
      amount: parsed.amount,
    },
    schema: walletSchema,
    errorSchema: apiResponseErrorSchema,
  })
}

export function useStoreDeposit() {
  return useMutation({
    mutationFn: storeDeposit,
    retry: false,
    onSuccess: async (wallet) => {
      queryClient.setQueryData([QUERY_KEYS.WALLETS.SINGLE], wallet)
      await queryInvalidator([
        [QUERY_KEYS.WALLETS.ALL, QUERY_KEYS.WALLETS.MOVEMENTS],
      ])
    },
  })
}
