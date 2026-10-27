"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import Sidebar from "@/src/components/ui/sidebar"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useIndexPrivateLots,
  type IndexPrivateLot,
} from "@/src/hooks/lots/queries/use-index-private-lots"

//* Schema imports
import type { PrivateLotStatus } from "@/src/schemas/lot"

const loadingSkeletonCount = 3

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

export const auctioneerLotStatusLabelKey = {
  LIVE: "live",
  SCHEDULED: "scheduled",
  ENDED: "closed",
  CANCELED: "canceled",
} as const satisfies Record<
  PrivateLotStatus,
  "live" | "scheduled" | "closed" | "canceled"
>

function moneyToNumber(value: string) {
  return Number(value)
}

function bidFor(lot: IndexPrivateLot) {
  if (lot.currentBid === null) {
    return {
      labelKey: "minimalValue" as const,
      amount: lot.openingBid,
    }
  }

  return {
    labelKey: "currentBid" as const,
    amount: lot.currentBid,
  }
}

function AuctioneerLotListItem(props: { lot: IndexPrivateLot }) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const bid = bidFor(props.lot)
  const statusKey = auctioneerLotStatusLabelKey[props.lot.status]

  return (
    <Sidebar.MenuItem>
      <Link
        id={`auctioneer-lot-link-${props.lot.id}`}
        href={`/auction/${props.lot.id}`}
        className="flex flex-col gap-1 rounded-md p-2 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <span className="line-clamp-2 font-medium wrap-break-word">
          {props.lot.title}
        </span>
        <span className="text-xs text-sidebar-foreground/70">
          {t(`statuses.${statusKey}`)}
        </span>
        <span>
          <span className="text-sidebar-foreground/70">{t(bid.labelKey)}</span>{" "}
          {format.number(moneyToNumber(bid.amount), currencyFormat)}
        </span>
      </Link>
    </Sidebar.MenuItem>
  )
}

export function AuctioneerLotList(props: {
  query: string
  status?: PrivateLotStatus
}) {
  const t = useTranslations("pages./auctioneer")
  const lotsQuery = useIndexPrivateLots({
    q: props.query,
    status: props.status,
  })
  const lots = lotsQuery.data?.lots ?? []

  return (
    <section
      id="auctioneer-lots"
      className="flex flex-col gap-2"
      aria-labelledby="auctioneer-lots-label"
    >
      <h2
        id="auctioneer-lots-label"
        className="px-2 text-xs font-medium text-sidebar-foreground/70"
      >
        {t("lotsLabel")}
      </h2>
      {lotsQuery.isError ? (
        <p id="auctioneer-lots-error" className="px-2">
          {t("lotsError")}
        </p>
      ) : lotsQuery.isPending ? (
        <>
          <p className="sr-only">{t("lotsLoading")}</p>
          <ul
            aria-labelledby="auctioneer-lots-label"
            aria-busy="true"
            className="flex flex-col gap-2"
          >
            {Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <li key={`auctioneer-lot-skeleton-${index}`}>
                <Skeleton className="h-16 w-full" />
              </li>
            ))}
          </ul>
        </>
      ) : lots.length === 0 ? (
        <p id="auctioneer-lots-empty" className="px-2">
          {t("lotsEmpty")}
        </p>
      ) : (
        <Sidebar.Menu>
          {lots.map((lot) => (
            <AuctioneerLotListItem key={lot.id} lot={lot} />
          ))}
        </Sidebar.Menu>
      )}
    </section>
  )
}
