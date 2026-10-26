"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { AuditBidCard } from "@/src/components/audit/audit-bid-card"
import { LotItemCard } from "@/src/components/audit/lot-item-card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import type { LotAudit as LotAuditData } from "@/src/lib/audit/mock-audit"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

export function AuctionRoom(props: { audit: LotAuditData }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const lot = props.audit.lot

  return (
    <section
      id="auction-room"
      className="flex w-full flex-col gap-4 rounded-xl p-6 ring-1 ring-foreground/10"
      aria-labelledby="auction-room-name"
    >
      <div
        id="auction-room-header"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ring-foreground/10"
      >
        <h2 id="auction-room-name" className="font-heading text-xl font-medium">
          {lot.name}
        </h2>
        <Badge variant="secondary">{t(`statuses.${lot.status}`)}</Badge>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card.Root id="lot-info" className="h-full">
          <Card.Header>
            <Card.Title>
              <h3 id="lot-info-title">{t("lotInfo")}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul id="lot-items" className="flex flex-col gap-3">
              {props.audit.items.map((item) => (
                <li key={item.id}>
                  <LotItemCard item={item} />
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card.Root>
        <div className="flex h-full flex-col gap-4">
          <Card.Root id="bid-panel">
            <Card.Header>
              <Card.Title>
                <h3 id="current-bid-title">{t("currentBid")}</h3>
              </Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <p
                id="current-bid-value"
                className="font-heading text-2xl font-medium"
              >
                {format.number(lot.currentBid, currencyFormat)}
              </p>
              {lot.status === "live" ? (
                <div id="place-bid-form" className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bid-amount">{t("bidValue")}</Label>
                    <Input
                      id="bid-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder={t("bidValue")}
                      className="border-foreground/30 bg-background dark:border-foreground/30 dark:bg-background"
                    />
                  </div>
                  <Button id="place-bid" type="button">
                    {t("placeBid")}
                  </Button>
                </div>
              ) : null}
            </Card.Content>
          </Card.Root>
          <Card.Root id="bid-history" className="flex-1">
            <Card.Header>
              <Card.Title>
                <h3 id="bid-history-title">{t("bidHistory")}</h3>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {props.audit.bids.length === 0 ? (
                <p id="bid-history-empty">{t("emptyBids")}</p>
              ) : (
                <ul id="auction-bids" className="flex flex-col gap-3">
                  {props.audit.bids.map((bid) => (
                    <li key={bid.id}>
                      <AuditBidCard bid={bid} />
                    </li>
                  ))}
                </ul>
              )}
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </section>
  )
}
