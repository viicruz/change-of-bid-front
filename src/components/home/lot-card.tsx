"use client"

//* Libraries imports
import { FileSearchIcon } from "lucide-react"
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
import type { IndexLot } from "@/src/hooks/lots/queries/use-index-lots"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

const scheduleFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

function bidLabelKey(status: PublicLotStatus) {
  if (status === "ENDED") {
    return "finalBid" as const
  }

  return "currentBid" as const
}

function scheduleFor(lot: IndexLot) {
  if (lot.status === "SCHEDULED") {
    return {
      labelKey: "startsAt" as const,
      value: lot.startsAt,
    }
  }

  if (lot.status === "ENDED") {
    return {
      labelKey: "endedAt" as const,
      value: lot.endsAt,
    }
  }

  return {
    labelKey: "endsAt" as const,
    value: lot.endsAt,
  }
}

function moneyToNumber(value: string) {
  return Number(value)
}

export function LotCard(props: { lot: IndexLot }) {
  const t = useTranslations("pages./")
  const format = useFormatter()
  const schedule = scheduleFor(props.lot)
  const showsBid = props.lot.status !== "SCHEDULED"
  const showsAudit = props.lot.status === "ENDED"
  const bidAmount = props.lot.currentBid ?? props.lot.openingBid

  return (
    <>
      <Link
        id={`lot-link-${props.lot.id}`}
        href={`/auction/${props.lot.id}`}
        className="absolute inset-0"
      >
        <Card className="h-full">
          <CardHeader className={showsAudit ? "min-w-0 pr-32" : "min-w-0"}>
            <CardTitle>
              <h3 className="line-clamp-3 font-heading text-base font-medium wrap-break-word">
                {props.lot.title}
              </h3>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {showsBid ? (
              <p>
                <span className="text-muted-foreground">
                  {t(bidLabelKey(props.lot.status))}
                </span>{" "}
                {format.number(moneyToNumber(bidAmount), currencyFormat)}
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">
                {t(schedule.labelKey)}
              </span>{" "}
              {format.dateTime(schedule.value, scheduleFormat)}
            </p>
          </CardContent>
        </Card>
      </Link>
      {showsAudit ? (
        <Link
          id={`lot-audit-link-${props.lot.id}`}
          href={`/auction/${props.lot.id}/audit`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "absolute top-4 right-4 z-10",
          })}
        >
          <FileSearchIcon aria-hidden data-icon="inline-start" />
          {t("audit")}
        </Link>
      ) : null}
    </>
  )
}
