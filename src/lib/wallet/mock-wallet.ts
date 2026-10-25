export const transactionDescriptionKeys = [
  "deposit",
  "bid",
  "refund",
  "devTopUp",
] as const

export type TransactionDescriptionKey =
  (typeof transactionDescriptionKeys)[number]

export type WalletTransaction = {
  id: string
  descriptionKey: TransactionDescriptionKey
  amount: number
  occurredAt: string
}

export const mockTransactions: WalletTransaction[] = [
  {
    id: "txn-deposit",
    descriptionKey: "deposit",
    amount: 500,
    occurredAt: "2026-10-22T14:30:00.000-03:00",
  },
  {
    id: "txn-bid",
    descriptionKey: "bid",
    amount: -150,
    occurredAt: "2026-10-23T18:10:00.000-03:00",
  },
  {
    id: "txn-refund",
    descriptionKey: "refund",
    amount: 80,
    occurredAt: "2026-10-24T11:00:00.000-03:00",
  },
]

export function walletBalance(transactions: WalletTransaction[]) {
  return transactions.reduce((total, transaction) => {
    return total + transaction.amount
  }, 0)
}

export function transactionsNewestFirst(transactions: WalletTransaction[]) {
  return [...transactions].sort((left, right) => {
    return (
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    )
  })
}

export function parsePositiveAmount(value: string) {
  const amount = Number(value)

  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  return amount
}

export function createDevTopUp(amount: number): WalletTransaction {
  return {
    id: `txn-dev-${crypto.randomUUID()}`,
    descriptionKey: "devTopUp",
    amount,
    occurredAt: new Date().toISOString(),
  }
}
