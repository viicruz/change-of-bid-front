"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState } from "react"

//* Components imports
import { BalanceCard } from "@/src/components/wallet/balance-card"
import { DevBalanceNotice } from "@/src/components/wallet/dev-balance-notice"
import { TransactionList } from "@/src/components/wallet/transaction-list"

//* Lib imports
import {
  createDevTopUp,
  mockTransactions,
  transactionsNewestFirst,
  walletBalance,
  type WalletTransaction,
} from "@/src/lib/wallet/mock-wallet"

export function WalletSummary() {
  const t = useTranslations("pages./wallet")
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>(mockTransactions)
  const history = transactionsNewestFirst(transactions)

  function onAddBalance(amount: number) {
    setTransactions((current) => {
      return [createDevTopUp(amount), ...current]
    })
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <BalanceCard balance={walletBalance(transactions)} />
      <div className="w-full max-w-lg bg-red-500">
        <DevBalanceNotice onAddBalance={onAddBalance} />
      </div>
      <section
        className="flex w-full flex-col items-center gap-3"
        aria-labelledby="wallet-history-title"
      >
        <h2
          id="wallet-history-title"
          className="font-heading text-lg font-medium"
        >
          {t("historyTitle")}
        </h2>
        <TransactionList transactions={history} />
      </section>
    </div>
  )
}
