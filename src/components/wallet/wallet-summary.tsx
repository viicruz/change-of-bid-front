"use client"

import { useEffect } from "react"

//* Libraries imports
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";

//* Components imports
import { Skeleton } from "@/src/components/ui/skeleton"
import { BalanceCard } from "@/src/components/wallet/balance-card"
import { DepositForm } from "@/src/components/wallet/deposit-form"
import { TransactionList } from "@/src/components/wallet/transaction-list"
import { WalletMovementsPagination } from "@/src/components/wallet/wallet-movements-pagination"
import { Button } from "@/src/components/ui/button"

//* Hooks imports
import { useIndexWalletMovements } from "@/src/hooks/wallets/queries/use-index-wallet-movements"
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

const LIMIT_PER_PAGE = 5; // Limit of movements per page

export function WalletSummary() {
  const t = useTranslations("pages./wallet");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const safePage = Math.max(page, 1)
  const walletQuery = useShowWallet();
  const movementsQuery = useIndexWalletMovements({
    page: safePage,
    limit: LIMIT_PER_PAGE,
  });

  const total = movementsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT_PER_PAGE))
  const showPagination = safePage > 1 || total > LIMIT_PER_PAGE;

  function onDeposited() {
    setPage(1)
  }

  useEffect(() => {
    if (!movementsQuery.isSuccess) return

    const normalizedPage = Math.min(Math.max(page, 1), totalPages)
    if (normalizedPage !== page) setPage(normalizedPage)
  }, [movementsQuery.isSuccess, page, setPage, totalPages])

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        {walletQuery.isError ? (
          <div id="wallet-balance-error" className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4" role="alert">
            <p>{t("error")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => walletQuery.refetch()} disabled={walletQuery.isFetching}>
              {walletQuery.isFetching ? t("retrying") : t("retry")}
            </Button>
          </div>
        ) : walletQuery.isPending ? (
          <>
            <p className="sr-only">{t("loading")}</p>
            <Skeleton className="h-40 w-full" />
          </>
        ) : (
          <BalanceCard
            totalBalance={walletQuery.data.totalBalance}
            committedBalance={walletQuery.data.committedBalance}
            availableBalance={walletQuery.data.availableBalance}
          />
        )}
        <DepositForm onDeposited={onDeposited} />
      </div>
      <section
        className="flex min-w-0 flex-col items-center gap-3 lg:items-stretch"
        aria-labelledby="wallet-history-title"
      >
        <h2
          id="wallet-history-title"
          className="font-heading text-lg font-medium"
        >
          {t("historyTitle")}
        </h2>
        {movementsQuery.isError ? (
          <div id="wallet-movements-error" className="flex w-full flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 lg:items-start" role="alert">
            <p>{t("movements.error")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => movementsQuery.refetch()} disabled={movementsQuery.isFetching}>
              {movementsQuery.isFetching ? t("retrying") : t("retry")}
            </Button>
          </div>
        ) : movementsQuery.isPending ? (
          <>
            <p className="sr-only">{t("movements.loading")}</p>
            <Skeleton className="h-24 w-full" />
          </>
        ) : movementsQuery.data.movements.length === 0 ? (
          <p id="wallet-movements-empty">{t("movements.empty")}</p>
        ) : (
          <TransactionList movements={movementsQuery.data.movements} />
        )}
        {showPagination ? (
          <WalletMovementsPagination
            total={total}
            limit={LIMIT_PER_PAGE}
          />
        ) : null}
      </section>
    </div>
  )
}
