"use client"

//* Libraries imports
import { FileSearchIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useState, type ReactNode } from "react"

//* Components imports
import { LiveDot } from "@/src/components/ui/brand"
import { Button, buttonVariants } from "@/src/components/ui/button"

//* Hooks imports
import type { IndexLot } from "@/src/hooks/lots/queries/use-index-lots"
import { useNow } from "@/src/hooks/use-now"

//* Lib imports
import { cn } from "@/src/lib/utils"

const imageWidth = 421
const imageHeight = 614
const imageSizes = "(min-width: 1280px) 240px, (min-width: 640px) 40vw, 80vw"

//* Under ten minutes the timer turns red
const endingSoonMs = 10 * 60 * 1000

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

//* Short enough to fit the "Opens" box: 30/10 20:00
const scheduleDayFormat = {
  day: "2-digit",
  month: "2-digit",
} as const

const scheduleTimeFormat = {
  hour: "2-digit",
  minute: "2-digit",
} as const

const endedFormat = {
  day: "2-digit",
  month: "short",
} as const

function moneyToNumber(value: string) {
  return Number(value)
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const time = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  if (days > 0) {
    return `${String(days)}d ${time}`
  }

  return time
}

function lotHref(lot: IndexLot) {
  return `/auction/${lot.id}`
}

/** Card art over the hatched "stage", with the status badge in the corner. */
function LotStage(props: {
  lot: IndexLot
  className: string
  imageClassName?: string
  children?: ReactNode
}) {
  const t = useTranslations("pages./")
  const imagePath = props.lot.items[0]?.imagePath

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b-4 border-black px-7.5 py-5.5",
        props.className
      )}
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt={t("cardAlt", { name: props.lot.items[0]?.cardName ?? "" })}
          width={imageWidth}
          height={imageHeight}
          sizes={imageSizes}
          className={cn(
            "block h-auto w-full shadow-[0_12px_24px_rgba(0,0,0,0.55)]",
            props.imageClassName
          )}
        />
      ) : (
        <div aria-hidden="true" className="aspect-59/86 w-full bg-black/30" />
      )}
      {props.children}
    </div>
  )
}

function CornerBadge(props: { className: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "absolute top-0 left-0 flex items-center gap-1.5 border-r-3 border-b-3 border-black px-2.5 py-1.5 font-heading text-xs",
        props.className
      )}
    >
      {props.children}
    </span>
  )
}

function LotTitle(props: { lot: IndexLot }) {
  const t = useTranslations("pages./")

  return (
    <div>
      <h3 className="m-0 font-heading text-lg leading-[1.15] font-normal wrap-break-word">
        <Link
          id={`lot-link-${props.lot.id}`}
          href={lotHref(props.lot)}
          className="text-inherit no-underline hover:text-red-text"
        >
          {props.lot.title}
        </Link>
      </h3>
      <p className="mt-1.5 mb-0 text-sm text-muted-foreground">
        {t("cardCount", { count: props.lot.items.length })}
      </p>
    </div>
  )
}

function Label(props: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "text-xs font-bold tracking-[1px] text-muted-foreground uppercase",
        props.className
      )}
    >
      {props.children}
    </div>
  )
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
    >
      <path d="M6 9a6 6 0 0 1 12 0c0 6 3 8 3 8H3s3-2 3-8" />
      <path d="M10 21h4" />
    </svg>
  )
}

function LotTimer(props: { endsAt: Date }) {
  const t = useTranslations("pages./")
  const now = useNow()
  const remainingMs = Math.max(0, props.endsAt.getTime() - now)
  const urgent = remainingMs < endingSoonMs

  function label() {
    if (remainingMs === 0) {
      return t("closed")
    }

    if (urgent) {
      return t("endingSoon")
    }

    return t("endsIn")
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-2 border-black px-3 py-2 text-[13px] font-bold tracking-[0.5px] uppercase",
        urgent ? "bg-brand-red text-white" : "bg-brand-ink text-brand-yellow"
      )}
    >
      <ClockIcon />
      <span className="whitespace-nowrap">{label()}</span>
      <span className="ml-auto font-heading text-base whitespace-nowrap tabular-nums">
        {formatCountdown(remainingMs)}
      </span>
    </div>
  )
}

function LiveLotCard(props: { lot: IndexLot }) {
  const t = useTranslations("pages./")
  const format = useFormatter()
  const bidAmount = props.lot.currentBid ?? props.lot.openingBid

  return (
    <article className="lift flex h-full flex-col border-4 border-border bg-card text-card-foreground shadow-hard-8 shadow-brand-red">
      <LotStage
        lot={props.lot}
        className="bg-stage bg-[repeating-linear-gradient(-45deg,rgba(246,186,4,0.10)_0_2px,transparent_2px_14px)]"
      >
        <CornerBadge className="bg-brand-red text-white">
          <LiveDot size={7} />
          {t("liveBadge")}
        </CornerBadge>
      </LotStage>
      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <LotTitle lot={props.lot} />
        <div className="flex items-end justify-between gap-2">
          <div>
            <Label>{t("currentBid")}</Label>
            <div className="font-heading text-[26px] leading-[1.1]">
              {format.number(moneyToNumber(bidAmount), currencyFormat)}
            </div>
          </div>
          <div className="pb-1 text-sm font-semibold text-muted-foreground">
            {t("bidCount", { count: props.lot.bidCount })}
          </div>
        </div>
        <LotTimer endsAt={props.lot.endsAt} />
        <Link
          id={`lot-cta-${props.lot.id}`}
          href={lotHref(props.lot)}
          className={buttonVariants({
            size: "sm",
            className: "mt-auto h-auto w-full py-3.5 text-lg shadow-shadow-neutral",
          })}
        >
          {t("placeBid")}
        </Link>
      </div>
    </article>
  )
}

function ScheduledLotCard(props: { lot: IndexLot }) {
  const t = useTranslations("pages./")
  const format = useFormatter()
  //* No reminders API yet: the toggle only lives in this page
  const [reminded, setReminded] = useState(false)

  return (
    <article className="lift flex h-full flex-col border-4 border-black bg-card text-card-foreground shadow-hard-8 shadow-brand-ink">
      <LotStage
        lot={props.lot}
        className="bg-stage bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.12)_0_2px,transparent_2px_14px)]"
      >
        <CornerBadge className="bg-brand-yellow text-brand-ink">
          {t("scheduledBadge")}
        </CornerBadge>
      </LotStage>
      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <LotTitle lot={props.lot} />
        <div className="flex border-3 border-input">
          <div className="flex-1 bg-brand-ink px-2.5 py-2 text-brand-yellow">
            <Label className="text-[11px] text-white">{t("opensAt")}</Label>
            <div className="font-heading text-[17px] leading-[1.2]">
              {/* Breaks between day and time when the box is narrow */}
              <span className="whitespace-nowrap">
                {format.dateTime(props.lot.startsAt, scheduleDayFormat)}
              </span>{" "}
              <span className="whitespace-nowrap">
                {format.dateTime(props.lot.startsAt, scheduleTimeFormat)}
              </span>
            </div>
          </div>
          <div className="flex-1 border-l-3 border-input px-2.5 py-2">
            <Label className="text-[11px]">{t("startingBid")}</Label>
            <div className="font-heading text-[17px] leading-[1.2]">
              {format.number(
                moneyToNumber(props.lot.openingBid),
                currencyFormat
              )}
            </div>
          </div>
        </div>
        <Button
          id={`lot-remind-${props.lot.id}`}
          type="button"
          variant="dark"
          size="sm"
          aria-pressed={reminded}
          className="mt-auto h-auto w-full gap-2.5 py-3.5 text-base"
          onClick={() => setReminded((current) => !current)}
        >
          <BellIcon />
          {reminded ? t("reminded") : t("remind")}
        </Button>
      </div>
    </article>
  )
}

function EndedLotCard(props: { lot: IndexLot }) {
  const t = useTranslations("pages./")
  const format = useFormatter()
  const finalAmount = props.lot.currentBid ?? props.lot.openingBid

  return (
    <article className="flex h-full flex-col border-4 border-border bg-card text-card-foreground shadow-hard-8">
      <LotStage
        lot={props.lot}
        className="bg-stage-closed"
        imageClassName="opacity-75 grayscale-[0.85] contrast-[0.9]"
      >
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-1/2 -rotate-14 border-5 bg-white px-4 py-2 font-heading text-2xl whitespace-nowrap shadow-[6px_6px_0_#000] outline-3 outline-black",
            props.lot.sold
              ? "border-brand-red text-brand-red"
              : "border-brand-ink text-brand-ink"
          )}
        >
          {props.lot.sold ? t("sold") : t("unsold")}
        </div>
      </LotStage>
      <div className="flex flex-1 flex-col gap-3 p-4.5">
        <LotTitle lot={props.lot} />
        <div className="flex items-end justify-between gap-2 border-t-3 border-dashed border-input pt-3">
          <div>
            <Label>{props.lot.sold ? t("finalPrice") : t("startingBid")}</Label>
            <div className="font-heading text-2xl leading-[1.1] text-red-text">
              {format.number(moneyToNumber(finalAmount), currencyFormat)}
            </div>
          </div>
          <div className="text-right text-[13px] font-semibold text-muted-foreground">
            {t("endedOn", {
              date: format.dateTime(props.lot.endsAt, endedFormat),
            })}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Link
            id={`lot-cta-${props.lot.id}`}
            href={lotHref(props.lot)}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-full text-foreground",
            })}
          >
            {t("details")}
          </Link>
          <Link
            id={`lot-audit-link-${props.lot.id}`}
            href={`/auction/${props.lot.id}/audit`}
            className={buttonVariants({
              variant: "link",
              className: "min-h-9 justify-center",
            })}
          >
            <FileSearchIcon aria-hidden data-icon="inline-start" />
            {t("audit")}
          </Link>
        </div>
      </div>
    </article>
  )
}

export function LotCard(props: { lot: IndexLot }) {
  if (props.lot.status === "SCHEDULED") {
    return <ScheduledLotCard lot={props.lot} />
  }

  if (props.lot.status === "ENDED") {
    return <EndedLotCard lot={props.lot} />
  }

  return <LiveLotCard lot={props.lot} />
}
