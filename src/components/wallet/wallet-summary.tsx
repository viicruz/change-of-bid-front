"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState, type MouseEvent } from "react"

//* Components imports
import Pagination from "@/src/components/ui/pagination"
import { Skeleton } from "@/src/components/ui/skeleton"
import { BalanceCard } from "@/src/components/wallet/balance-card"
import { DepositForm } from "@/src/components/wallet/deposit-form"
import { TransactionList } from "@/src/components/wallet/transaction-list"

//* Hooks imports
import { useIndexWalletMovements } from "@/src/hooks/wallets/queries/use-index-wallet-movements"
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

//* Lib imports
import { getPaginationPageItems } from "@/src/lib/pagination"

const movementPageLimit = 5

export function WalletSummary() {
  const t = useTranslations("pages./wallet")
  const walletQuery = useShowWallet()
  const [page, setPage] = useState(1)
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

  function onDeposited() {
    setPage(1)
  }

  function onPageChange(nextPage: number) {
    if (nextPage === page || nextPage < 1 || nextPage > pageCount) {
      return
    }

    setPage(nextPage)
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
        <BalanceCard balance={Number(walletQuery.data.totalBalance)} />
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
            page={page}
            pageCount={pageCount}
            onPageChange={onPageChange}
          />
        ) : null}
      </section>
    </div>
  )
}

type WalletMovementsPaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

function WalletMovementsPagination(props: WalletMovementsPaginationProps) {
  const t = useTranslations("pages./wallet")
  const items = getPaginationPageItems(props.page, props.pageCount)

  function onPrevious() {
    props.onPageChange(props.page - 1)
  }

  function onNext() {
    props.onPageChange(props.page + 1)
  }

  function onPageClick(event: MouseEvent<HTMLButtonElement>) {
    const nextPage = Number(event.currentTarget.dataset.page)

    if (!Number.isInteger(nextPage)) {
      return
    }

    props.onPageChange(nextPage)
  }

  return (
    <Pagination.Root
      id="wallet-movements-pagination"
      aria-label={t("movements.pagination")}
    >
      <Pagination.Content className="flex-wrap justify-center">
        <Pagination.Item>
          <Pagination.Previous
            id="wallet-movements-previous"
            type="button"
            size="icon"
            text={t("movements.previous")}
            aria-label={t("movements.previous")}
            disabled={props.page <= 1}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onPrevious}
          />
        </Pagination.Item>
        {items.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <Pagination.Item key={`wallet-movements-ellipsis-${index}`}>
                <Pagination.Ellipsis label={t("movements.morePages")} />
              </Pagination.Item>
            )
          }

          return (
            <Pagination.Item key={item}>
              <Pagination.Link
                id={`wallet-movements-page-${item}`}
                type="button"
                isActive={item === props.page}
                data-page={item}
                aria-label={
                  item === props.page
                    ? t("movements.currentPage", { page: String(item) })
                    : t("movements.goToPage", { page: String(item) })
                }
                onClick={onPageClick}
              >
                {item}
              </Pagination.Link>
            </Pagination.Item>
          )
        })}
        <Pagination.Item>
          <Pagination.Next
            id="wallet-movements-next"
            type="button"
            size="icon"
            text={t("movements.next")}
            aria-label={t("movements.next")}
            disabled={props.page >= props.pageCount}
            className="px-0! **:data-[slot=pagination-label]:sr-only"
            onClick={onNext}
          />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
