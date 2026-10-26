"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { AuditBidCard } from "@/src/components/audit/audit-bid-card"
import { LotItemCard } from "@/src/components/audit/lot-item-card"
import { Badge } from "@/src/components/ui/badge"
import Card from "@/src/components/ui/card"

//* Lib imports
import type { LotAudit as LotAuditData } from "@/src/lib/audit/mock-audit"
import type { LotStatus } from "@/src/lib/lots/mock-lots"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

function bidLabelKey(status: LotStatus) {
  if (status === "closed" || status === "canceled") {
    return "finalBid" as const
  }

  return "currentBid" as const
}

function endLabelKey(status: LotStatus) {
  if (status === "closed" || status === "canceled") {
    return "endedAt" as const
  }

  return "endsAt" as const
}

export function LotAudit(props: { audit: LotAuditData }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const format = useFormatter()
  const lot = props.audit.lot

  return (
    <section
      id="lot-audit"
      className="flex w-full flex-col gap-4 rounded-xl p-6 ring-1 ring-foreground/10"
      aria-labelledby="lot-audit-name"
    >
      <div
        id="lot-audit-header"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ring-foreground/10"
      >
        <h2 id="lot-audit-name" className="font-heading text-xl font-medium">
          {lot.name}
        </h2>
        <Badge variant="secondary">{t(`statuses.${lot.status}`)}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card.Root id="lot-info">
          <Card.Header>
            <Card.Title>
              <h3 id="lot-info-title">{t("lotInfo")}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>
                <span className="text-muted-foreground">
                  {t(bidLabelKey(lot.status))}
                </span>{" "}
                {format.number(lot.currentBid, currencyFormat)}
              </p>
              <p>
                <span className="text-muted-foreground">{t("startsAt")}</span>{" "}
                {format.dateTime(new Date(lot.startsAt), dateFormat)}
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t(endLabelKey(lot.status))}
                </span>{" "}
                {format.dateTime(new Date(lot.endsAt), dateFormat)}
              </p>
            </div>
            <ul id="lot-items" className="flex flex-col gap-3">
              {props.audit.items.map((item) => (
                <li key={item.id}>
                  <LotItemCard item={item} />
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card.Root>
        <Card.Root id="audit-bid-history">
          <Card.Header>
            <Card.Title>
              <h3 id="audit-bid-history-title">{t("bidHistory")}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul id="audit-bids" className="flex flex-col gap-3">
              {props.audit.bids.map((bid) => (
                <li key={bid.id}>
                  <AuditBidCard bid={bid} />
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card.Root>
      </div>
    </section>
  )
}
