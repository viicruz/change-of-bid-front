"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

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

function AuctioneerLotListItem(props: {
  lot: IndexPrivateLot
  selected: boolean
  onSelectLot: (lotId: string) => void
}) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const bid = bidFor(props.lot)
  const statusKey = auctioneerLotStatusLabelKey[props.lot.status]

  function onSelect() {
    props.onSelectLot(props.lot.id)
  }

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        id={`auctioneer-lot-${props.lot.id}`}
        type="button"
        isActive={props.selected}
        className="h-auto items-start py-2 whitespace-normal"
        onClick={onSelect}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="line-clamp-2 font-medium wrap-break-word">
            {props.lot.title}
          </span>
          <span className="text-xs text-sidebar-foreground/70">
            {t(`statuses.${statusKey}`)}
          </span>
          <span className="wrap-break-word whitespace-normal">
            <span className="text-sidebar-foreground/70">
              {t(bid.labelKey)}
            </span>{" "}
            {format.number(moneyToNumber(bid.amount), currencyFormat)}
          </span>
        </div>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  )
}

export function AuctioneerLotList(props: {
  query: string
  status?: PrivateLotStatus
  selectedLotId: string | null
  onSelectLot: (lotId: string) => void
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
            <AuctioneerLotListItem
              key={lot.id}
              lot={lot}
              selected={props.selectedLotId === lot.id}
              onSelectLot={props.onSelectLot}
            />
          ))}
        </Sidebar.Menu>
      )}
    </section>
  )
}
