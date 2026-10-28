"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useRef } from "react"

//* Components imports
import {
  AuctioneerPaneHeader,
  auctioneerPaneClassName,
} from "@/src/components/auctioneer/auctioneer-pane"
import { CardThumb } from "@/src/components/auctioneer/card-thumb"
import { LotSummaryGrid } from "@/src/components/auctioneer/lot-summary"
import { Button } from "@/src/components/ui/button"

//* Schema imports
import type { Lot } from "@/src/schemas/lot"

//* Lib imports
import { durationBetween } from "@/src/lib/lots/lot-schedule"
import { cn } from "@/src/lib/utils"

const whenFormat = {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
} as const

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

//* A lot whose start already passed opens right away and lists as live
export function createdLotStatus(lot: Lot, now: Date) {
  return lot.startsAt.getTime() > now.getTime() ? "SCHEDULED" : "LIVE"
}

function itemsByPosition(items: Lot["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

type LotCreatedProps = {
  lot: Lot
  now: Date
  onCreateAnother: () => void
  onViewInList: () => void
}

export function LotCreated(props: LotCreatedProps) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const scheduled = createdLotStatus(props.lot, props.now) === "SCHEDULED"
  const values = {
    start: format.dateTime(props.lot.startsAt, whenFormat),
    end: format.dateTime(props.lot.endsAt, whenFormat),
    value: format.number(Number(props.lot.openingBid), currencyFormat),
  }

  //* The submit button is gone: take the focus to the news instead
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div
      id="create-lot-success"
      role="status"
      className="flex flex-col gap-5 border-4 border-border bg-card p-[clamp(22px,4vw,40px)] shadow-hard-8 shadow-brand-red"
    >
      <span
        id="create-lot-success-tag"
        className="-rotate-1 animate-pop self-start border-3 border-black bg-brand-yellow px-3 py-1.5 font-heading text-[15px] text-brand-ink motion-reduce:animate-none"
      >
        {t("createdTag")}
      </span>
      <h2
        ref={headingRef}
        id="create-lot-success-title"
        tabIndex={-1}
        className="font-heading text-[clamp(26px,3vw,40px)] leading-[1.05] font-normal wrap-break-word outline-none"
      >
        {t("createdTitle", { title: props.lot.title })}
      </h2>
      <p
        id="create-lot-success-text"
        className="max-w-155 text-base leading-relaxed text-muted-foreground"
      >
        {scheduled
          ? t("createdTextScheduled", values)
          : t("createdTextLive", values)}
      </p>
      <ul aria-label={t("cardsInLot")} className="flex flex-wrap gap-2.5">
        {itemsByPosition(props.lot.items).map((item) => (
          <li key={item.id}>
            <CardThumb
              name={item.cardName}
              imageUrl={item.imagePath}
              size="lg"
              className="shadow-hard-4"
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3.5">
        <Button
          id="create-another-lot"
          type="button"
          onClick={props.onCreateAnother}
        >
          {t("createAnother")}
        </Button>
        <Button
          id="view-created-lot"
          type="button"
          variant="outline"
          onClick={props.onViewInList}
        >
          {scheduled ? t("viewScheduled") : t("viewLive")}
        </Button>
      </div>
    </div>
  )
}

//* The published values, read-only, where the form was
export function LotCreatedDetails(props: { lot: Lot; className?: string }) {
  const t = useTranslations("pages./auctioneer")
  const cardCount = props.lot.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div
      id="create-lot-success-details"
      className={cn(auctioneerPaneClassName, "shadow-hard-8", props.className)}
    >
      <AuctioneerPaneHeader
        titleId="lot-details-title"
        title={t("lotDetails")}
      />
      <div className="p-4.5">
        <LotSummaryGrid
          idPrefix="created-lot-summary"
          cardCount={cardCount}
          duration={durationBetween(props.lot.startsAt, props.lot.endsAt)}
          openingBid={props.lot.openingBid}
          minIncrement={props.lot.minIncrement}
        />
      </div>
    </div>
  )
}
