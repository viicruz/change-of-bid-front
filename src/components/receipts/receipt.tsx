"use client"

//* Libraries imports
import { CheckIcon, PrinterIcon, Share2Icon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"
import { useState, type ReactNode } from "react"

//* Components imports
import { LotItemList } from "@/src/components/cards/lot-item-list"
import { ArrowRightIcon, Tag } from "@/src/components/ui/brand"
import { Button, buttonVariants } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useShowReceipt,
  type ShowReceipt,
} from "@/src/hooks/receipts/queries/use-show-receipt"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { cn } from "@/src/lib/utils"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "long",
  timeStyle: "short",
} as const

//* Error boxes share the hard-edged look of the rest of the page
const errorBox =
  "flex w-full flex-col items-start gap-4 border-4 border-border bg-card p-[22px] font-semibold text-red-text shadow-hard-8 shadow-brand-red"

type ReceiptData = ShowReceipt["receipt"]

function moneyToNumber(value: string) {
  return Number(value)
}

function itemsByPosition(items: ReceiptData["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

function isMissingReceipt(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

function SmallLabel(props: { className?: string; children: ReactNode }) {
  return (
    <dt
      className={cn(
        "text-[11px] font-bold tracking-[1px] text-muted-foreground uppercase",
        props.className
      )}
    >
      {props.children}
    </dt>
  )
}

type ShareState = "idle" | "copied" | "error"

function ShareStatus(props: { state: ShareState }) {
  const t = useTranslations("pages./receipts/[shareToken]")

  if (props.state === "idle") {
    return null
  }

  if (props.state === "error") {
    return (
      <p
        id="receipt-share-status"
        role="status"
        className="m-0 text-sm font-bold text-red-text"
      >
        {t("shareError")}
      </p>
    )
  }

  return (
    <p
      id="receipt-share-status"
      role="status"
      className="m-0 flex -rotate-1 animate-pop items-center gap-2 border-3 border-black bg-brand-yellow px-3 py-2 text-sm font-bold text-brand-ink motion-reduce:animate-none"
    >
      <CheckIcon
        aria-hidden="true"
        className="size-4"
        strokeWidth={3.5}
        strokeLinecap="square"
      />
      {t("copied")}
    </p>
  )
}

function ReceiptActions() {
  const t = useTranslations("pages./receipts/[shareToken]")
  const [shareState, setShareState] = useState<ShareState>("idle")

  function onPrint() {
    window.print()
  }

  async function onShare() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareState("copied")
    } catch {
      setShareState("error")
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <ShareStatus state={shareState} />
      <Button
        id="receipt-print"
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrint}
      >
        <PrinterIcon
          aria-hidden="true"
          data-icon="inline-start"
          strokeWidth={3}
          strokeLinecap="square"
        />
        {t("print")}
      </Button>
      <Button
        id="receipt-share"
        type="button"
        variant="outline"
        size="icon"
        aria-label={t("share")}
        onClick={onShare}
      >
        <Share2Icon aria-hidden="true" strokeWidth={3} strokeLinecap="square" />
      </Button>
    </div>
  )
}

function ReceiptSummary(props: { receipt: ReceiptData }) {
  const t = useTranslations("pages./receipts/[shareToken]")
  const format = useFormatter()
  const receipt = props.receipt

  return (
    <div
      id="receipt-summary"
      className="border-4 border-border bg-card shadow-[10px_10px_0_var(--color-brand-red)] print:shadow-none"
    >
      <div className="flex items-center gap-2.5 border-b-4 border-black bg-brand-ink px-4.5 py-3.5 font-bold tracking-[0.5px] text-brand-yellow uppercase">
        <CheckIcon
          aria-hidden="true"
          className="size-5"
          strokeWidth={3.5}
          strokeLinecap="square"
        />
        {t("settled")}
      </div>
      <div className="flex flex-col gap-5 p-5.5">
        <div>
          <h2 className="m-0 text-[13px] font-bold tracking-[1px] text-muted-foreground uppercase">
            {t("finalAmount")}
          </h2>
          <p
            id="receipt-final-amount"
            className="m-0 type-value text-[clamp(36px,4vw,48px)]"
          >
            {format.number(moneyToNumber(receipt.finalAmount), currencyFormat)}
          </p>
        </div>
        <dl className="m-0 border-3 border-input">
          <div className="flex flex-col gap-1 px-3.5 py-3">
            <SmallLabel>{t("endedAt")}</SmallLabel>
            <dd id="receipt-ended-at" className="m-0 font-bold">
              <time dateTime={receipt.endedAt.toISOString()}>
                {format.dateTime(receipt.endedAt, dateFormat)}
              </time>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t-3 border-input bg-brand-ink px-3.5 py-3 text-brand-yellow">
            <SmallLabel className="text-white">{t("winner")}</SmallLabel>
            <dd id="receipt-winner" className="m-0 font-heading text-2xl">
              #{receipt.winnerParticipantNo}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 print:hidden">
          <Link
            id="receipt-view-lot"
            href={`/auction/${receipt.lotId}`}
            className={buttonVariants({ className: "w-full no-underline" })}
          >
            {t("viewLot")}
          </Link>
          <Link
            id="receipt-view-audit"
            href={`/auction/${receipt.lotId}/audit`}
            className="flex min-h-11 items-center justify-center gap-2 font-heading text-sm text-foreground no-underline hover:text-red-text"
          >
            {t("viewAudit")}
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function ReceiptDocument(props: { receipt: ReceiptData }) {
  const t = useTranslations("pages./receipts/[shareToken]")
  const receipt = props.receipt
  const items = itemsByPosition(receipt.items)
  const totalCards = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <article
      id="receipt"
      aria-labelledby="receipt-title"
      //* Keeps the brand colors on paper: yellow text needs its dark background
      className="flex flex-col gap-10 [print-color-adjust:exact]"
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap gap-2.5">
            <Tag tone="yellow">{t("eyebrow")}</Tag>
            <Tag tone="dark">{t("cardCount", { count: totalCards })}</Tag>
          </div>
          <h1 id="receipt-title" className="m-0 type-h1 wrap-break-word">
            {receipt.title}
          </h1>
          {receipt.description ? (
            <p
              id="receipt-description"
              className="m-0 max-w-170 text-[17px] leading-[1.55] whitespace-pre-line text-muted-foreground"
            >
              {receipt.description}
            </p>
          ) : null}
        </div>
        <ReceiptActions />
      </div>
      <div className="flex flex-wrap items-start gap-10">
        <section
          aria-labelledby="receipt-items-title"
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-4"
        >
          <h2 id="receipt-items-title" className="m-0 type-h2">
            {t("items")}
          </h2>
          <LotItemList idPrefix="receipt-item" items={items} />
        </section>
        <aside
          aria-label={t("summary")}
          className="flex min-w-0 flex-[1_1_380px] flex-col"
        >
          <ReceiptSummary receipt={receipt} />
        </aside>
      </div>
    </article>
  )
}

function ReceiptSkeleton() {
  const t = useTranslations("pages./receipts/[shareToken]")

  return (
    <div id="receipt-loading" aria-busy="true" className="flex flex-col gap-10">
      <p className="sr-only">{t("loading")}</p>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-5 w-full max-w-170" />
      </div>
      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-72 w-full" />
        </div>
        <Skeleton className="h-96 min-w-0 flex-[1_1_380px]" />
      </div>
    </div>
  )
}

function ReceiptProblem(props: { id: string; alert?: boolean; message: string }) {
  const t = useTranslations("pages./receipts/[shareToken]")

  return (
    <div className={errorBox}>
      <p id={props.id} role={props.alert ? "alert" : undefined} className="m-0">
        {props.message}
      </p>
      <Link
        id="receipt-browse-auctions"
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

export function Receipt(props: { shareToken: string }) {
  const t = useTranslations("pages./receipts/[shareToken]")
  const receiptQuery = useShowReceipt({ shareToken: props.shareToken })

  if (receiptQuery.isError) {
    return (
      <ReceiptProblem
        id="receipt-error"
        alert
        message={
          isMissingReceipt(receiptQuery.error) ? t("notFound") : t("error")
        }
      />
    )
  }

  if (!receiptQuery.data) {
    if (receiptQuery.fetchStatus === "idle") {
      return <ReceiptProblem id="receipt-invalid" message={t("invalid")} />
    }

    return <ReceiptSkeleton />
  }

  return <ReceiptDocument receipt={receiptQuery.data.receipt} />
}
