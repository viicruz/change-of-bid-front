"use client"

//* Libraries imports
import { CheckIcon, TriangleAlertIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"
import type { ReactNode } from "react"

//* Components imports
import { AuditBidRow } from "@/src/components/audit/audit-bid-row"
import { LotItemList } from "@/src/components/cards/lot-item-list"
import { LiveDot, Tag } from "@/src/components/ui/brand"
import { buttonVariants } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useShowLotAudit,
  type ShowLotAudit,
} from "@/src/hooks/lots/queries/use-show-lot-audit"
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { cn } from "@/src/lib/utils"

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

const statusTagTone = {
  SCHEDULED: "yellow",
  LIVE: "red",
  ENDED: "dark",
  CANCELED: "inverse",
} as const

const chainTagTone = {
  INTACT: "dark",
  TAMPERED: "red",
  VERIFICATION_FAILED: "inverse",
} as const

//* Error boxes share the hard-edged look of the rest of the page
const errorBox =
  "flex w-full flex-col items-start gap-4 border-4 border-border bg-card p-[22px] font-semibold text-red-text shadow-hard-8 shadow-brand-red"

const warningBanner =
  "m-0 flex items-start gap-2.5 border-3 border-black px-4 py-3 font-bold"

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

function StatCell(props: {
  id?: string
  label: string
  className?: string
  labelClassName?: string
  children: ReactNode
}) {
  return (
    <div
      id={props.id}
      className={cn("flex flex-col gap-1 px-4 py-3.5", props.className)}
    >
      <span
        className={cn(
          "text-[11px] font-bold tracking-[1px] text-muted-foreground uppercase",
          props.labelClassName
        )}
      >
        {props.label}
      </span>{" "}
      {props.children}
    </div>
  )
}

function AuditHeading(props: { lot: PublicLot; audit: PublicAudit }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const lot = props.lot
  const audit = props.audit

  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap gap-2.5">
          <Tag tone="yellow">{t("pageTag")}</Tag>
          <Tag id="lot-audit-status" tone={statusTagTone[lot.status]}>
            {lot.status === "LIVE" ? <LiveDot /> : null}
            {t(`statuses.${statusLabelKey[lot.status]}`)}
          </Tag>
          <Tag id="lot-audit-chain" tone={chainTagTone[audit.status]}>
            {audit.status === "INTACT" ? (
              <CheckIcon
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={3.5}
                strokeLinecap="square"
              />
            ) : (
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={3}
                strokeLinecap="square"
              />
            )}
            {t(`auditStatuses.${audit.status}`)}
          </Tag>
        </div>
        <h1 id="lot-audit-name" className="m-0 type-h1 wrap-break-word">
          {lot.title}
        </h1>
        <p className="m-0 max-w-170 text-[17px] text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <Link
        id="lot-audit-back"
        href={`/auction/${lot.id}`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "no-underline",
        })}
      >
        {t("backToLot")}
      </Link>
    </div>
  )
}

function LotInfo(props: { lot: PublicLot }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const format = useFormatter()
  const lot = props.lot

  return (
    <div
      id="lot-info"
      className="grid border-4 border-border bg-card shadow-hard-8 sm:grid-cols-3"
    >
      <StatCell
        id="lot-audit-bid"
        label={t(bidLabelKey(lot.status))}
        className="bg-brand-ink text-brand-yellow"
        labelClassName="text-white"
      >
        <span className="font-heading text-xl">
          {lot.currentBid === null
            ? t("noCurrentBid")
            : format.number(moneyToNumber(lot.currentBid), currencyFormat)}
        </span>
      </StatCell>
      <StatCell
        label={t("startsAt")}
        className="border-t-3 border-input sm:border-t-0 sm:border-l-3"
      >
        <time dateTime={lot.startsAt.toISOString()} className="font-bold">
          {format.dateTime(lot.startsAt, dateFormat)}
        </time>
      </StatCell>
      <StatCell
        label={t(endLabelKey(lot.status))}
        className="border-t-3 border-input sm:border-t-0 sm:border-l-3"
      >
        <time dateTime={lot.endsAt.toISOString()} className="font-bold">
          {format.dateTime(lot.endsAt, dateFormat)}
        </time>
      </StatCell>
    </div>
  )
}

function AuditBidHistory(props: { audit: PublicAudit }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const bids = props.audit.bids

  return (
    <div
      id="audit-bid-history"
      className="border-4 border-border bg-card shadow-[10px_10px_0_var(--color-brand-red)]"
    >
      <div className="flex items-center justify-between gap-3 border-b-4 border-black bg-brand-ink px-4.5 py-4 text-white">
        <h2
          id="audit-bid-history-title"
          className="m-0 font-heading text-xl font-normal"
        >
          {t("bidHistory")}
        </h2>
        {bids.length > 0 ? (
          <span className="text-sm font-bold whitespace-nowrap text-brand-yellow">
            {t("bidCount", { count: bids.length })}
          </span>
        ) : null}
      </div>
      {bids.length === 0 ? (
        <p id="audit-bids-empty" className="m-0 px-4.5 py-6 text-muted-foreground">
          {t("emptyBids")}
        </p>
      ) : (
        //* Oldest first: the chain is read in the order it was written
        <ol id="audit-bids" className="m-0 list-none p-0">
          {bids.map((bid, index) => (
            <AuditBidRow
              key={bid.sequence}
              bid={bid}
              last={index === bids.length - 1}
            />
          ))}
        </ol>
      )}
    </div>
  )
}

function LotAuditDetails(props: { lot: PublicLot; audit: PublicAudit }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const lot = props.lot
  const audit = props.audit
  const items = itemsByPosition(lot.items)

  return (
    <section
      id="lot-audit"
      aria-labelledby="lot-audit-name"
      className="flex flex-col gap-10"
    >
      <AuditHeading lot={lot} audit={audit} />
      {audit.status === "TAMPERED" ? (
        <p
          id="lot-audit-tampered"
          role="alert"
          className={cn(warningBanner, "-mt-4 bg-brand-red text-white")}
        >
          {t("tamperedWarning")}
        </p>
      ) : null}
      {audit.status === "VERIFICATION_FAILED" ? (
        <p
          id="lot-audit-verification-failed"
          role="alert"
          className={cn(warningBanner, "-mt-4 bg-brand-yellow text-brand-ink")}
        >
          {t("verificationFailedWarning")}
        </p>
      ) : null}
      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-9">
          <section
            aria-labelledby="lot-info-title"
            className="flex flex-col gap-4"
          >
            <h2 id="lot-info-title" className="m-0 type-h2">
              {t("lotInfo")}
            </h2>
            <LotInfo lot={lot} />
          </section>
          <section
            aria-labelledby="lot-cards-title"
            className="flex flex-col gap-4"
          >
            <h2 id="lot-cards-title" className="m-0 type-h2">
              {t("cards")}
            </h2>
            <LotItemList idPrefix="lot-item" items={items} />
          </section>
        </div>
        <aside
          aria-labelledby="audit-bid-history-title"
          className="flex min-w-0 flex-[1_1_380px] flex-col"
        >
          <AuditBidHistory audit={audit} />
        </aside>
      </div>
    </section>
  )
}

function LotAuditSkeleton() {
  const t = useTranslations("pages./auction/[id]/audit")

  return (
    <div id="lot-audit-loading" aria-busy="true" className="flex flex-col gap-10">
      <p className="sr-only">{t("loading")}</p>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-5 w-full max-w-170" />
      </div>
      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-96 min-w-0 flex-[1_1_380px]" />
      </div>
    </div>
  )
}

function LotAuditProblem(props: { id: string; alert?: boolean; message: string }) {
  const t = useTranslations("pages./auction/[id]/audit")

  return (
    <div className={errorBox}>
      <p id={props.id} role={props.alert ? "alert" : undefined} className="m-0">
        {props.message}
      </p>
      <Link
        id="lot-audit-browse-auctions"
        href="/"
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "no-underline",
        })}
      >
        {t("browseAuctions")}
      </Link>
    </div>
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
      <LotAuditProblem
        id="lot-audit-error"
        alert
        message={missing ? t("notFound") : t("error")}
      />
    )
  }

  if (!lotQuery.data || !auditQuery.data) {
    const lotDisabled = !lotQuery.data && lotQuery.fetchStatus === "idle"
    const auditDisabled = !auditQuery.data && auditQuery.fetchStatus === "idle"

    if (lotDisabled || auditDisabled) {
      return <LotAuditProblem id="lot-audit-missing" message={t("notFound")} />
    }

    return <LotAuditSkeleton />
  }

  return (
    <LotAuditDetails lot={lotQuery.data.lot} audit={auditQuery.data.audit} />
  )
}
