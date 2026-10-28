"use client"

//* Libraries imports
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";

//* Components imports
import { Skeleton } from "@/src/components/ui/skeleton"
import { BalanceCard } from "@/src/components/wallet/balance-card"
import { DepositForm } from "@/src/components/wallet/deposit-form"
import { TransactionList } from "@/src/components/wallet/transaction-list"
import { WalletMovementsPagination } from "@/src/components/wallet/wallet-movements-pagination"

//* Hooks imports
import { useIndexWalletMovements } from "@/src/hooks/wallets/queries/use-index-wallet-movements"
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

const LIMIT_PER_PAGE = 5; // Limit of movements per page

export function WalletSummary() {
  const t = useTranslations("pages./wallet");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const walletQuery = useShowWallet();
  const movementsQuery = useIndexWalletMovements({
    page,
    limit: LIMIT_PER_PAGE,
  });

  const total = movementsQuery.data?.total ?? 0;
  const showPagination = page > 1 || total > LIMIT_PER_PAGE;

  function onDeposited() {
    setPage(1)
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
          totalBalance={walletQuery.data.totalBalance}
          committedBalance={walletQuery.data.committedBalance}
          availableBalance={walletQuery.data.availableBalance}
        />
      )}
      <div className="w-full max-w-lg">
        <DepositForm onDeposited={onDeposited} />
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
          <WalletMovementsPagination
            total={total}
            limit={LIMIT_PER_PAGE}
          />
        ) : null}
      </section>
    </div>
  )
}
