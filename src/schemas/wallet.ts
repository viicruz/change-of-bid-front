//* Libraries imports
import * as z from "zod"

const walletMoneySchema = z.string().regex(/^(?:0|[1-9]\d*)\.\d{2}$/)

export const walletSchema = z.object({
  totalBalance: walletMoneySchema,
  committedBalance: walletMoneySchema,
  availableBalance: walletMoneySchema,
})

export type Wallet = z.infer<typeof walletSchema>
