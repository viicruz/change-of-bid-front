"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { AuditBidCard } from "@/src/components/audit/audit-bid-card"
import { LotItemCard } from "@/src/components/audit/lot-item-card"
import { Badge } from "@/src/components/ui/badge"
import Card from "@/src/components/ui/card"

//* Hooks imports
import {
  useShowLotAudit,
  type ShowLotAudit,
} from "@/src/hooks/lots/queries/use-show-lot-audit"
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { ApiError } from "@/src/lib/api"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

const statusLabelKey = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  ENDED: "closed",
  CANCELED: "canceled",
} as const

const auditStatusVariant = {
  INTACT: "secondary",
  TAMPERED: "destructive",
  VERIFICATION_FAILED: "outline",
} as const

type PublicLot = ShowLot["lot"]
type PublicAudit = ShowLotAudit["audit"]

function moneyToNumber(value: string) {
  return Number(value)
}

function itemsByPosition(items: PublicLot["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

function bidLabelKey(status: PublicLot["status"]) {
  if (status === "ENDED" || status === "CANCELED") {
    return "finalBid" as const
  }

  return "currentBid" as const
}

function endLabelKey(status: PublicLot["status"]) {
  if (status === "ENDED" || status === "CANCELED") {
    return "endedAt" as const
  }

  return "endsAt" as const
}

function isMissingLot(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

function LotAuditDetails(props: { lot: PublicLot; audit: PublicAudit }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const format = useFormatter()
  const lot = props.lot
  const audit = props.audit
  const items = itemsByPosition(lot.items)

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
          {lot.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge id="lot-audit-status" variant="secondary">
            {t(`statuses.${statusLabelKey[lot.status]}`)}
          </Badge>
          <Badge
            id="lot-audit-chain"
            variant={auditStatusVariant[audit.status]}
          >
            {t(`auditStatuses.${audit.status}`)}
          </Badge>
        </div>
      </div>
      {audit.status === "TAMPERED" ? (
        <p id="lot-audit-tampered" role="alert" className="text-destructive">
          {t("tamperedWarning")}
        </p>
      ) : null}
      {audit.status === "VERIFICATION_FAILED" ? (
        <p id="lot-audit-verification-failed" role="alert">
          {t("verificationFailedWarning")}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card.Root id="lot-info">
          <Card.Header>
            <Card.Title>
              <h3 id="lot-info-title">{t("lotInfo")}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p id="lot-audit-bid">
                <span className="text-muted-foreground">
                  {t(bidLabelKey(lot.status))}
                </span>{" "}
                {lot.currentBid === null
                  ? t("noCurrentBid")
                  : format.number(
                      moneyToNumber(lot.currentBid),
                      currencyFormat
                    )}
              </p>
              <p>
                <span className="text-muted-foreground">{t("startsAt")}</span>{" "}
                {format.dateTime(lot.startsAt, dateFormat)}
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t(endLabelKey(lot.status))}
                </span>{" "}
                {format.dateTime(lot.endsAt, dateFormat)}
              </p>
            </div>
            <ul
              id="lot-items"
              className="grid grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-3"
            >
              {items.map((item) => (
                <LotItemCard key={item.id} item={item} />
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
            {audit.bids.length === 0 ? (
              <p id="audit-bids-empty">{t("emptyBids")}</p>
            ) : (
              <ul id="audit-bids" className="flex flex-col gap-3">
                {audit.bids.map((bid) => (
                  <li key={bid.sequence}>
                    <AuditBidCard bid={bid} />
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>
        </Card.Root>
      </div>
    </section>
  )
}

export function LotAudit(props: { id: string }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const lotQuery = useShowLot({ id: props.id })
  const auditQuery = useShowLotAudit({ id: props.id })

  if (lotQuery.isError || auditQuery.isError) {
    const missing =
      isMissingLot(lotQuery.error) || isMissingLot(auditQuery.error)

    return (
      <p id="lot-audit-error" role="alert">
        {missing ? t("notFound") : t("error")}
      </p>
    )
  }

  if (!lotQuery.data || !auditQuery.data) {
    const lotDisabled = !lotQuery.data && lotQuery.fetchStatus === "idle"
    const auditDisabled = !auditQuery.data && auditQuery.fetchStatus === "idle"

    if (lotDisabled || auditDisabled) {
      return <p id="lot-audit-missing">{t("notFound")}</p>
    }

    return <p id="lot-audit-loading">{t("loading")}</p>
  }

  return (
    <LotAuditDetails lot={lotQuery.data.lot} audit={auditQuery.data.audit} />
  )
}
