"use client"

import { useEffect, useState } from "react"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl";
import { CheckIcon, PlusIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

//* Components imports
import { Skeleton } from "@/src/components/ui/skeleton"
import { Tag } from "@/src/components/ui/brand"
import { BalanceBar, BalanceCards } from "@/src/components/wallet/balance-card"
import { DepositForm } from "@/src/components/wallet/deposit-form"
import { HowBalanceWorks } from "@/src/components/wallet/how-balance-works"
import { TransactionList } from "@/src/components/wallet/transaction-list"
import { WalletMovementsPagination } from "@/src/components/wallet/wallet-movements-pagination"
import { Button } from "@/src/components/ui/button"

//* Hooks imports
import { useIndexWalletMovements } from "@/src/hooks/wallets/queries/use-index-wallet-movements"
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

const LIMIT_PER_PAGE = 5; // Limit of movements per page

//* Error boxes share the hard-edged look of the rest of the page
const errorBox =
  "flex w-full flex-col items-start gap-3 border-4 border-border bg-card p-[22px] font-semibold text-red-text shadow-hard-8 shadow-brand-red"

export function WalletSummary() {
  const t = useTranslations("pages./wallet");
  const format = useFormatter();
  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const walletQuery = useShowWallet();
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [depositedAmount, setDepositedAmount] = useState<string | null>(null)

  function onDepositOpen() {
    setIsDepositOpen(true)
    setDepositedAmount(null)
  }

  function onDepositCancel() {
    setIsDepositOpen(false)
  }

  function onDeposited(amount: string) {
    setIsDepositOpen(false)
    setDepositedAmount(amount)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-3">
          <Tag tone="yellow">{t("pageTag")}</Tag>
          <h1 className="font-heading text-[clamp(36px,5vw,64px)] leading-none font-normal">
            {t("title")}
          </h1>
          <p className="max-w-155 text-[17px] text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button
          id="wallet-deposit-open"
          type="button"
          aria-expanded={isDepositOpen}
          aria-controls={isDepositOpen ? "deposit-form" : undefined}
          onClick={onDepositOpen}
        >
          <PlusIcon aria-hidden="true" strokeWidth={3} strokeLinecap="square" />
          {t("deposit")}
        </Button>
      </div>

      {depositedAmount ? (
        <p
          id="wallet-deposit-success"
          role="status"
          className="-mt-6 flex animate-pop items-center gap-2.5 self-start border-3 border-black bg-brand-yellow px-4 py-3 font-bold text-brand-ink shadow-hard-5 shadow-black motion-reduce:animate-none -rotate-1"
        >
          <CheckIcon aria-hidden="true" className="size-5" strokeWidth={3.5} strokeLinecap="square" />
          {t("depositSuccess", {
            amount: format.number(Number(depositedAmount), {
              style: "currency",
              currency: "BRL",
            }),
          })}
        </p>
      ) : null}

      {isDepositOpen ? (
        <div className="-mt-4">
          <DepositForm
            availableBalance={walletQuery.data?.availableBalance}
            onDeposited={onDeposited}
            onCancel={onDepositCancel}
          />
        </div>
      ) : null}

      <section
        className="flex flex-col gap-6"
        aria-label={t("balanceSummary")}
      >
        {walletQuery.isError ? (
          <div id="wallet-balance-error" className={errorBox} role="alert">
            <p>{t("error")}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => walletQuery.refetch()} disabled={walletQuery.isFetching}>
              {walletQuery.isFetching ? t("retrying") : t("retry")}
            </Button>
          </div>
        ) : walletQuery.isPending ? (
          <>
            <p className="sr-only">{t("loading")}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-7">
              {Array.from({ length: 3 }).map((_, index) => {
                const key = `wallet-balance-skeleton-${index}`;
                return <Skeleton key={key} className="h-38 w-full" />
              })}
            </div>
            <Skeleton className="h-7 w-full" />
          </>
        ) : (
          <>
            <BalanceCards
              totalBalance={walletQuery.data.totalBalance}
              committedBalance={walletQuery.data.committedBalance}
              availableBalance={walletQuery.data.availableBalance}
            />
            <BalanceBar
              totalBalance={walletQuery.data.totalBalance}
              committedBalance={walletQuery.data.committedBalance}
              availableBalance={walletQuery.data.availableBalance}
            />
          </>
        )}
      </section>

      <HowBalanceWorks />
      <WalletMovementHistory />
    </div>
  )
}

function WalletMovementHistory() {
  const t = useTranslations("pages./wallet");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const safePage = Math.max(page, 1)
  const movementsQuery = useIndexWalletMovements({
    page: safePage,
    limit: LIMIT_PER_PAGE,
  });
  const total = movementsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT_PER_PAGE))
  const showPagination = safePage > 1 || total > LIMIT_PER_PAGE;

  useEffect(() => {
    if (!movementsQuery.isSuccess) return

    const normalizedPage = Math.min(Math.max(page, 1), totalPages)
    if (normalizedPage !== page) setPage(normalizedPage)
  }, [movementsQuery.isSuccess, page, setPage, totalPages])

  return (
    <section
      className="flex min-w-0 flex-col gap-[18px]"
      aria-labelledby="wallet-history-title"
    >
      <h2 id="wallet-history-title" className="type-h2">
        {t("historyTitle")}
      </h2>
      <WalletMovementContent query={movementsQuery} t={t} />
      {showPagination ? (
        <WalletMovementsPagination total={total} limit={LIMIT_PER_PAGE} />
      ) : null}
    </section>
  )
}

function WalletMovementContent({
  query,
  t,
}: {
  query: ReturnType<typeof useIndexWalletMovements>
  t: ReturnType<typeof useTranslations<"pages./wallet">>
}) {
  if (query.isError) {
    return (
      <div id="wallet-movements-error" className={errorBox} role="alert">
        <p>{t("movements.error")}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? t("retrying") : t("retry")}
        </Button>
      </div>
    )
  }

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-2">
        <p className="sr-only">{t("movements.loading")}</p>
        {
          Array.from({ length: LIMIT_PER_PAGE }).map((_, index) => {
            const key = `wallet-movement-skeleton-${index}`;
            return (
              <Skeleton key={key} className="h-13 w-full" />
            );
          })
        }
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border-4 border-border bg-card shadow-hard-8">
      {query.data.movements.length === 0 ? (
        <p id="wallet-movements-empty" className="p-7 text-center font-semibold text-muted-foreground">
          {t("movements.empty")}
        </p>
      ) : (
        <TransactionList movements={query.data.movements} />
      )}
    </div>
  )
}
