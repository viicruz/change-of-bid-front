"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import type { ComponentProps } from "react"

//* Components imports
import { CardThumb } from "@/src/components/auctioneer/card-thumb"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useIndexPrivateLots,
  type IndexPrivateLot,
} from "@/src/hooks/lots/queries/use-index-private-lots"

//* Schema imports
import type { PrivateLotStatus } from "@/src/schemas/lot"

//* Lib imports
import { cn } from "@/src/lib/utils"

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

//* Status badge colors from the design system; a canceled lot is struck out
type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

const statusBadge = {
  LIVE: { variant: "default", className: undefined },
  SCHEDULED: { variant: "secondary", className: undefined },
  ENDED: { variant: "inverse", className: undefined },
  CANCELED: {
    variant: "outline",
    className: "bg-muted text-muted-foreground line-through",
  },
} as const satisfies Record<
  PrivateLotStatus,
  { variant: BadgeVariant; className: string | undefined }
>

const whenLabelKey = {
  LIVE: "lotWhenLive",
  SCHEDULED: "lotWhenScheduled",
  ENDED: "lotWhenEnded",
  CANCELED: "lotWhenCanceled",
} as const satisfies Record<PrivateLotStatus, string>

const whenFormat = {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
} as const

function moneyToNumber(value: string) {
  return Number(value)
}

//* The bid the auctioneer cares about now: the current one, the sale or the opening
function lotValueFor(lot: IndexPrivateLot) {
  if (lot.currentBid !== null) {
    return {
      labelKey:
        lot.status === "ENDED" ? ("soldFor" as const) : ("currentBid" as const),
      amount: lot.currentBid,
    }
  }

  if (lot.status === "ENDED") {
    return { labelKey: "noBids" as const, amount: null }
  }

  return { labelKey: "minimalValue" as const, amount: lot.openingBid }
}

function itemsByPosition(items: IndexPrivateLot["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

function AuctioneerLotListItem(props: {
  lot: IndexPrivateLot
  selected: boolean
  isNew: boolean
  onSelectLot: (lotId: string) => void
}) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const lot = props.lot
  const value = lotValueFor(lot)
  const badge = statusBadge[lot.status]
  const cover = itemsByPosition(lot.items)[0]
  const cardCount = lot.items.reduce((sum, item) => sum + item.quantity, 0)
  const closed = lot.status === "ENDED" || lot.status === "CANCELED"
  const when = t(whenLabelKey[lot.status], {
    date: format.dateTime(
      lot.status === "SCHEDULED" ? lot.startsAt : lot.endsAt,
      whenFormat
    ),
  })

  function onSelect() {
    props.onSelectLot(lot.id)
  }

  return (
    <li className="border-b-3 border-line-soft last:border-b-0">
      <button
        id={`auctioneer-lot-${lot.id}`}
        type="button"
        data-active={props.selected ? "" : undefined}
        aria-current={props.selected ? "true" : undefined}
        className={cn(
          "flex w-full flex-wrap items-center gap-3 px-3.5 py-3 text-left outline-none hover:bg-muted focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring data-active:bg-muted",
          props.isNew && "bg-mine-row"
        )}
        onClick={onSelect}
      >
        <CardThumb
          name={cover?.cardName ?? lot.title}
          imageUrl={cover?.imagePath}
          size="xs"
          className={closed ? "grayscale-80" : undefined}
        />
        {/* Big amounts drop under the lot instead of squeezing its title */}
        <span className="flex min-w-0 grow basis-32 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge
              id={`auctioneer-lot-status-${lot.id}`}
              variant={badge.variant}
              className={cn("h-5 px-1.5 text-[10px]", badge.className)}
            >
              {t(`statuses.${auctioneerLotStatusLabelKey[lot.status]}`)}
            </Badge>
            {props.isNew ? (
              <Badge
                id={`auctioneer-lot-new-${lot.id}`}
                className="h-5 px-1.5 text-[10px]"
              >
                {t("newLot")}
              </Badge>
            ) : null}
          </span>
          <span className="line-clamp-2 text-[15px] font-bold wrap-break-word">
            {lot.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("cardsCount", { count: cardCount })} · {when}
          </span>
        </span>
        <span className="ml-auto shrink-0 text-right">
          <span className="block text-[10px] font-bold text-muted-foreground uppercase">
            {t(value.labelKey)}
          </span>
          <span
            id={`auctioneer-lot-value-${lot.id}`}
            className="font-heading text-sm"
          >
            {value.amount === null
              ? "—"
              : format.number(moneyToNumber(value.amount), currencyFormat)}
          </span>
        </span>
      </button>
    </li>
  )
}

export function AuctioneerLotList(props: {
  query: string
  status?: PrivateLotStatus
  selectedLotId: string | null
  newLotId?: string | null
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
      className="flex flex-col"
      aria-labelledby="auctioneer-lots-label"
    >
      <h2 id="auctioneer-lots-label" className="sr-only">
        {t("lotsLabel")}
      </h2>
      {lotsQuery.isError ? (
        <p id="auctioneer-lots-error" className="px-4 py-5 text-center">
          {t("lotsError")}
        </p>
      ) : lotsQuery.isPending ? (
        <>
          <p className="sr-only">{t("lotsLoading")}</p>
          <ul
            aria-labelledby="auctioneer-lots-label"
            aria-busy="true"
            className="flex flex-col gap-2 p-3.5"
          >
            {Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <li key={`auctioneer-lot-skeleton-${index}`}>
                <Skeleton className="h-16 w-full" />
              </li>
            ))}
          </ul>
        </>
      ) : lots.length === 0 ? (
        <p
          id="auctioneer-lots-empty"
          className="px-4 py-5 text-center font-semibold text-muted-foreground"
        >
          {t("lotsEmpty")}
        </p>
      ) : (
        <ul aria-labelledby="auctioneer-lots-label" className="flex flex-col">
          {lots.map((lot) => (
            <AuctioneerLotListItem
              key={lot.id}
              lot={lot}
              selected={props.selectedLotId === lot.id}
              isNew={props.newLotId === lot.id}
              onSelectLot={props.onSelectLot}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
