"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState } from "react"

//* Components imports
import { Skeleton } from "@/src/components/ui/skeleton"
import { BalanceCard } from "@/src/components/wallet/balance-card"
import { DevBalanceNotice } from "@/src/components/wallet/dev-balance-notice"
import { TransactionList } from "@/src/components/wallet/transaction-list"

//* Hooks imports
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

//* Lib imports
import {
  createDevTopUp,
  mockTransactions,
  transactionsNewestFirst,
  type WalletTransaction,
} from "@/src/lib/wallet/mock-wallet"

export function WalletSummary() {
  const t = useTranslations("pages./wallet")
  const walletQuery = useShowWallet()
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>(mockTransactions)
  const history = transactionsNewestFirst(transactions)
  const sessionCredit = transactions
    .filter((transaction) => {
      return transaction.descriptionKey === "devTopUp"
    })
    .reduce((total, transaction) => {
      return total + transaction.amount
    }, 0)

  function onAddBalance(amount: number) {
    setTransactions((current) => {
      return [createDevTopUp(amount), ...current]
    })
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {walletQuery.isError ? (
        <p id="wallet-balance-error">{t("error")}</p>
      ) : walletQuery.isPending ? (
        <>
          <p className="sr-only">{t("loading")}</p>
          <Skeleton className="h-24 w-full max-w-lg" />
        </>
      ) : (
        <BalanceCard
          balance={Number(walletQuery.data.totalBalance) + sessionCredit}
        />
      )}
      <div className="w-full max-w-lg">
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
