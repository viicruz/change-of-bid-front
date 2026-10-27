"use client"

//* Libraries imports
import { FileSearchIcon, ReceiptTextIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import { buttonVariants } from "@/src/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

//* Hooks imports
import type { IndexParticipation } from "@/src/hooks/participations/queries/use-index-participations"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

function bidLabelKey(status: IndexParticipation["status"]) {
  if (status === "ENDED") {
    return "finalBid" as const
  }

  return "currentBid" as const
}

function scheduleFor(participation: IndexParticipation) {
  if (participation.status === "SCHEDULED") {
    return {
      labelKey: "startsAt" as const,
      value: participation.startsAt,
    }
  }

  if (participation.status === "ENDED") {
    return {
      labelKey: "endedAt" as const,
      value: participation.endsAt,
    }
  }

  return {
    labelKey: "endsAt" as const,
    value: participation.endsAt,
  }
}

function moneyToNumber(value: string) {
  return Number(value)
}

export function BidCard(props: { participation: IndexParticipation }) {
  const t = useTranslations("pages./my-bids")
  const format = useFormatter()
  const schedule = scheduleFor(props.participation)
  const showsBid = props.participation.status !== "SCHEDULED"
  const bidAmount =
    props.participation.currentBid ?? props.participation.openingBid

  const shareToken = props.participation.shareToken
  const showsReceipt = props.participation.won && shareToken !== null
  const showsAudit = props.participation.status === "ENDED"

  return (
    <Card id={`bid-card-${props.participation.id}`}>
      <CardHeader>
        <CardTitle>{props.participation.title}</CardTitle>
        {showsReceipt ? (
          <CardAction>
            <Link
              id={`bid-receipt-link-${props.participation.id}`}
              href={`/receipts/${shareToken}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ReceiptTextIcon aria-hidden data-icon="inline-start" />
              {t("viewReceipt")}
            </Link>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-2">
        <p id={`bid-status-${props.participation.id}`}>
          {t(`statuses.${props.participation.status}`)}
        </p>
        {showsBid ? (
          <p id={`bid-amount-${props.participation.id}`}>
            <span className="text-muted-foreground">
              {t(bidLabelKey(props.participation.status))}
            </span>{" "}
            {format.number(moneyToNumber(bidAmount), currencyFormat)}
          </p>
        ) : null}
        <p id={`bid-schedule-${props.participation.id}`}>
          <span className="text-muted-foreground">{t(schedule.labelKey)}</span>{" "}
          {format.dateTime(schedule.value, dateFormat)}
        </p>
        {props.participation.won ? (
          <p id={`bid-won-${props.participation.id}`}>{t("won")}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            id={`bid-lot-link-${props.participation.id}`}
            href={`/auction/${props.participation.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            {t("viewLot")}
          </Link>
          {showsAudit ? (
            <Link
              id={`bid-audit-link-${props.participation.id}`}
              href={`/auction/${props.participation.id}/audit`}
              className={buttonVariants({ variant: "outline" })}
            >
              <FileSearchIcon aria-hidden data-icon="inline-start" />
              {t("audit")}
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
