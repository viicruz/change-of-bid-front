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

//* Lib imports
import type { Bid } from "@/src/lib/bids/mock-bids"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

export function BidCard(props: { bid: Bid }) {
  const t = useTranslations("pages./my-bids")
  const format = useFormatter()

  return (
    <Card id={`bid-card-${props.bid.id}`}>
      <CardHeader>
        <CardTitle>{props.bid.lotName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-2">
        <p>
          <span className="text-muted-foreground">{t("bidAmount")}</span>{" "}
          {format.number(props.bid.amount, currencyFormat)}
        </p>
        <p>
          <span className="text-muted-foreground">{t("bidTime")}</span>{" "}
          {format.dateTime(new Date(props.bid.placedAt), dateFormat)}
        </p>
        <Link
          id={`bid-lot-link-${props.bid.id}`}
          href={`/lot/${props.bid.lotId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          {t("viewLot")}
        </Link>
      </CardContent>
    </Card>
  )
}
