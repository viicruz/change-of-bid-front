"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState } from "react"

//* Components imports
import Pagination from "@/src/components/ui/pagination"
import { Skeleton } from "@/src/components/ui/skeleton"
import { BalanceCard } from "@/src/components/wallet/balance-card"
import { DevBalanceNotice } from "@/src/components/wallet/dev-balance-notice"
import { TransactionList } from "@/src/components/wallet/transaction-list"

//* Hooks imports
import { useIndexWalletMovements } from "@/src/hooks/wallets/queries/use-index-wallet-movements"
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

const movementPageLimit = 20

export function WalletSummary() {
  const t = useTranslations("pages./wallet")
  const walletQuery = useShowWallet()
  const [page, setPage] = useState(1)
  const [sessionCredit, setSessionCredit] = useState(0)
  const movementsQuery = useIndexWalletMovements({
    page,
    limit: movementPageLimit,
  })
  const total = movementsQuery.data?.total
  const pageCount =
    total === undefined
      ? page
      : Math.max(1, Math.ceil(total / movementPageLimit))
  const showPagination =
    page > 1 || (total !== undefined && total > movementPageLimit)

  function onAddBalance(amount: number) {
    setSessionCredit((current) => {
      return current + amount
    })
  }

  function onPreviousPage() {
    setPage((current) => {
      return Math.max(1, current - 1)
    })
  }

  function onNextPage() {
    setPage((current) => {
      return Math.min(pageCount, current + 1)
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
        {movementsQuery.isError ? (
          <p id="wallet-movements-error">{t("movements.error")}</p>
        ) : movementsQuery.isPending ? (
          <>
            <p className="sr-only">{t("movements.loading")}</p>
            <Skeleton className="h-24 w-full max-w-lg" />
          </>
        ) : movementsQuery.data.movements.length === 0 ? (
          <p id="wallet-movements-empty">{t("movements.empty")}</p>
        ) : (
          <TransactionList movements={movementsQuery.data.movements} />
        )}
        {showPagination ? (
          <Pagination.Root
            id="wallet-movements-pagination"
            aria-label={t("movements.pagination")}
          >
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  id="wallet-movements-previous"
                  type="button"
                  text={t("movements.previous")}
                  aria-label={t("movements.previous")}
                  disabled={page === 1}
                  onClick={onPreviousPage}
                />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Next
                  id="wallet-movements-next"
                  type="button"
                  text={t("movements.next")}
                  aria-label={t("movements.next")}
                  disabled={page >= pageCount}
                  onClick={onNextPage}
                />
              </Pagination.Item>
            </Pagination.Content>
          </Pagination.Root>
        ) : null}
      </section>
    </div>
  )
}
