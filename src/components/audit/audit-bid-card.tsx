"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

//* Hooks imports
import type { ShowLotAudit } from "@/src/hooks/lots/queries/use-show-lot-audit"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

type AuditBid = ShowLotAudit["audit"]["bids"][number]

function moneyToNumber(value: string) {
  return Number(value)
}

export function AuditBidCard(props: { bid: AuditBid }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const format = useFormatter()
  const bid = props.bid

  return (
    <Card.Root id={`audit-bid-${bid.sequence}`}>
      <Card.Content className="flex flex-col gap-1">
        <p>
          <span className="text-muted-foreground">{t("participant")}</span>{" "}
          {bid.participantNo}
        </p>
        <p>
          <span className="text-muted-foreground">{t("bidAmount")}</span>{" "}
          {format.number(moneyToNumber(bid.amount), currencyFormat)}
        </p>
        <p>
          <span className="text-muted-foreground">{t("bidTime")}</span>{" "}
          {format.dateTime(bid.createdAt, dateFormat)}
        </p>
      </Card.Content>
    </Card.Root>
  )
}
