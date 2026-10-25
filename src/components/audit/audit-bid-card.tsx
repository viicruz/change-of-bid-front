"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

//* Lib imports
import { censorBidderName } from "@/src/lib/audit/censor-bidder-name"
import type { AuditBid } from "@/src/lib/audit/mock-audit"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

export function AuditBidCard(props: { bid: AuditBid }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const format = useFormatter()
  const bidderName = censorBidderName(props.bid.bidderName)

  return (
    <Card.Root id={`audit-bid-${props.bid.id}`}>
      <Card.Content className="flex flex-col gap-1">
        <p>
          <span className="text-muted-foreground">{t("bidder")}</span>{" "}
          {bidderName}
        </p>
        <p>
          <span className="text-muted-foreground">{t("bidAmount")}</span>{" "}
          {format.number(props.bid.amount, currencyFormat)}
        </p>
        <p>
          <span className="text-muted-foreground">{t("bidTime")}</span>{" "}
          {format.dateTime(new Date(props.bid.placedAt), dateFormat)}
        </p>
      </Card.Content>
    </Card.Root>
  )
}
