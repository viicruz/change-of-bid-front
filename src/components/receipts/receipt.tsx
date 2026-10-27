"use client"

//* Libraries imports
import { PrinterIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Image from "next/image"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import {
  useShowReceipt,
  type ShowReceipt,
} from "@/src/hooks/receipts/queries/use-show-receipt"

//* Local imports
import { ApiError } from "@/src/lib/api"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "long",
  timeStyle: "short",
} as const

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

function ReceiptItem(props: { item: ReceiptData["items"][number] }) {
  const t = useTranslations("pages./receipts/[shareToken]")
  const item = props.item

  return (
    <li className="min-w-0">
      <article id={`receipt-item-${item.id}`} className="flex flex-col gap-2">
        <div className="relative aspect-59/86 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/20">
          <Image
            src={item.imagePath}
            alt=""
            width={421}
            height={614}
            sizes="(min-width: 640px) 8rem, 40vw"
            className="size-full object-cover"
          />
        </div>
        <p id={`receipt-item-name-${item.id}`} className="text-sm font-medium">
          {item.cardName}
        </p>
        <p
          id={`receipt-item-quantity-${item.id}`}
          className="text-sm text-muted-foreground"
        >
          <span>{t("quantity")}</span> {item.quantity}
        </p>
      </article>
    </li>
  )
}

function ReceiptDocument(props: { receipt: ReceiptData }) {
  const t = useTranslations("pages./receipts/[shareToken]")
  const format = useFormatter()
  const receipt = props.receipt
  const items = itemsByPosition(receipt.items)

  function onPrint() {
    window.print()
  }

  return (
    <article
      id="receipt"
      className="flex w-full flex-col gap-8 rounded-xl bg-card px-6 py-8 ring-1 ring-foreground/10 sm:px-10"
    >
      <div aria-hidden="true" className="h-1 w-16 bg-foreground" />
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {t("eyebrow")}
        </p>
        <h2
          id="receipt-title"
          className="font-heading text-3xl font-medium tracking-tight"
        >
          {receipt.title}
        </h2>
        {receipt.description ? (
          <p id="receipt-description" className="text-muted-foreground">
            {receipt.description}
          </p>
        ) : null}
      </header>
      <div className="flex flex-col gap-1 border-y border-border py-6">
        <p className="text-sm text-muted-foreground">{t("finalAmount")}</p>
        <p
          id="receipt-final-amount"
          className="font-heading text-4xl font-medium tracking-tight"
        >
          {format.number(moneyToNumber(receipt.finalAmount), currencyFormat)}
        </p>
      </div>
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">{t("endedAt")}</dt>
          <dd id="receipt-ended-at">
            {format.dateTime(receipt.endedAt, dateFormat)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">{t("winner")}</dt>
          <dd id="receipt-winner">{receipt.winnerParticipantNo}</dd>
        </div>
      </dl>
      <section
        className="flex flex-col gap-4"
        aria-labelledby="receipt-items-title"
      >
        <h3
          id="receipt-items-title"
          className="font-heading text-lg font-medium"
        >
          {t("items")}
        </h3>
        <ul
          id="receipt-items"
          className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4"
        >
          {items.map((item) => (
            <ReceiptItem key={item.id} item={item} />
          ))}
        </ul>
      </section>
      <div className="flex justify-end print:hidden">
        <Button
          id="receipt-print"
          type="button"
          variant="outline"
          onClick={onPrint}
        >
          <PrinterIcon aria-hidden />
          {t("print")}
        </Button>
      </div>
    </article>
  )
}

function ReceiptSkeleton() {
  const t = useTranslations("pages./receipts/[shareToken]")

  return (
    <div
      id="receipt-loading"
      aria-busy="true"
      className="flex w-full flex-col gap-8 rounded-xl px-6 py-8 ring-1 ring-foreground/10 sm:px-10"
    >
      <p className="sr-only">{t("loading")}</p>
      <Skeleton className="h-1 w-16" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4">
        <Skeleton className="aspect-59/86 w-full" />
        <Skeleton className="aspect-59/86 w-full" />
      </div>
    </div>
  )
}

export function Receipt(props: { shareToken: string }) {
  const t = useTranslations("pages./receipts/[shareToken]")
  const receiptQuery = useShowReceipt({ shareToken: props.shareToken })

  if (receiptQuery.isError) {
    return (
      <p id="receipt-error" role="alert">
        {isMissingReceipt(receiptQuery.error) ? t("notFound") : t("error")}
      </p>
    )
  }

  if (!receiptQuery.data) {
    if (receiptQuery.fetchStatus === "idle") {
      return <p id="receipt-invalid">{t("invalid")}</p>
    }

    return <ReceiptSkeleton />
  }

  return <ReceiptDocument receipt={receiptQuery.data.receipt} />
}
