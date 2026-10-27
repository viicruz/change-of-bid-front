"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import { buttonVariants } from "@/src/components/ui/button"
import {
  Card,
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

  return (
    <Card id={`bid-card-${props.participation.id}`}>
      <CardHeader>
        <CardTitle>{props.participation.title}</CardTitle>
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
        <Link
          id={`bid-lot-link-${props.participation.id}`}
          href={`/auction/${props.participation.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("viewLot")}
        </Link>
      </CardContent>
    </Card>
  )
}
