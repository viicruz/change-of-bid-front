"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

//* Lib imports
import type { Lot, LotStatus } from "@/src/lib/lots/mock-lots"

const scheduleFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

function bidLabelKey(status: LotStatus) {
  if (status === "closed") {
    return "finalBid" as const
  }

  return "currentBid" as const
}

function scheduleFor(lot: Lot) {
  if (lot.status === "scheduled") {
    return {
      labelKey: "startsAt" as const,
      value: lot.startsAt,
    }
  }

  if (lot.status === "closed") {
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

export function LotCard(props: { lot: Lot }) {
  const t = useTranslations("pages./")
  const format = useFormatter()
  const schedule = scheduleFor(props.lot)
  const showsBid = props.lot.status !== "scheduled"

  return (
    <Card className="absolute inset-0">
      <CardHeader className="min-w-0">
        <CardTitle>
          <h3 className="line-clamp-3 font-heading text-base font-medium break-words">
            {props.lot.name}
          </h3>
        </CardTitle>
        <Badge variant="secondary">
          {t(`cardTypes.${props.lot.cardType}`)}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {showsBid ? (
          <p>
            <span className="text-muted-foreground">
              {t(bidLabelKey(props.lot.status))}
            </span>{" "}
            {format.number(props.lot.currentBid, {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        ) : null}
        <p>
          <span className="text-muted-foreground">{t(schedule.labelKey)}</span>{" "}
          {format.dateTime(new Date(schedule.value), scheduleFormat)}
        </p>
      </CardContent>
    </Card>
  )
}
