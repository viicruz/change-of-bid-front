//* Libraries imports
import * as z from "zod"

export const walletMoneySchema = z.string().regex(/^(?:0|[1-9]\d*)\.\d{2}$/)

export const walletSchema = z.object({
  totalBalance: walletMoneySchema,
  committedBalance: walletMoneySchema,
  availableBalance: walletMoneySchema,
})

export type Wallet = z.infer<typeof walletSchema>

export const walletMovementTypeSchema = z.enum([
  "DEPOSIT",
  "HOLD",
  "RELEASE",
  "SETTLEMENT_DEBIT",
  "SETTLEMENT_CREDIT",
])

export type WalletMovementType = z.infer<typeof walletMovementTypeSchema>

const walletMovementFields = {
  id: z.uuid(),
  amount: walletMoneySchema,
  createdAt: z.iso.datetime({ offset: true }),
}

export const walletMovementSchema = z.discriminatedUnion("type", [
  z.object({
    ...walletMovementFields,
    type: z.literal("DEPOSIT"),
    lotId: z.null(),
    bidId: z.null(),
  }),
  z.object({
    ...walletMovementFields,
    type: z.literal("HOLD"),
    lotId: z.uuid(),
    bidId: z.uuid(),
  }),
  z.object({
    ...walletMovementFields,
    type: z.literal("RELEASE"),
    lotId: z.uuid(),
    bidId: z.uuid(),
  }),
  z.object({
    ...walletMovementFields,
    type: z.literal("SETTLEMENT_DEBIT"),
    lotId: z.uuid(),
    bidId: z.null(),
  }),
  z.object({
    ...walletMovementFields,
    type: z.literal("SETTLEMENT_CREDIT"),
    lotId: z.uuid(),
    bidId: z.null(),
  }),
])

export type WalletMovement = z.infer<typeof walletMovementSchema>

export const walletMovementsSchema = z.object({
  movements: z.array(walletMovementSchema),
  page: z.number().int().min(1).max(1000),
  limit: z.number().int().min(1).max(50),
  total: z.number().int().nonnegative(),
})

export type WalletMovements = z.infer<typeof walletMovementsSchema>
