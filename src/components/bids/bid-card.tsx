"use client"

//* Libraries imports
import { FileSearchIcon, ReceiptTextIcon, TrophyIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

//* Components imports
import { LotTimer } from "@/src/components/home/lot-card"
import { LiveDot, Tag } from "@/src/components/ui/brand"
import { buttonVariants } from "@/src/components/ui/button"
import { FitAmount } from "@/src/components/utils/money"

//* Hooks imports
import type { IndexParticipation } from "@/src/hooks/participations/queries/use-index-participations"

//* Lib imports
import { cn } from "@/src/lib/utils"

const imageWidth = 421
const imageHeight = 614
const imageSizes = "(min-width: 640px) 104px, 72px"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

const statusTagTone = {
  SCHEDULED: "yellow",
  LIVE: "red",
  ENDED: "dark",
  CANCELED: "inverse",
} as const

//* Same hatched stages and shadows as the lot cards on the home page
const statusStyles = {
  LIVE: {
    article: "border-border shadow-brand-red",
    stage:
      "bg-stage bg-[repeating-linear-gradient(-45deg,rgba(246,186,4,0.10)_0_2px,transparent_2px_14px)]",
  },
  SCHEDULED: {
    article: "border-black shadow-brand-ink",
    stage:
      "bg-stage bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.12)_0_2px,transparent_2px_14px)]",
  },
  ENDED: {
    article: "border-border",
    stage: "bg-stage-closed",
  },
  CANCELED: {
    article: "border-border",
    stage: "bg-stage-closed",
  },
} as const

function bidLabelKey(status: IndexParticipation["status"]) {
  if (status === "ENDED") {
    return "finalBid" as const
  }

  return "currentBid" as const
}

function scheduleFor(participation: IndexParticipation) {
  if (participation.status === "SCHEDULED") {
    return {
      labelKey: "startsAt" as const,
      value: participation.startsAt,
    }
  }

  if (participation.status === "ENDED") {
    return {
      labelKey: "endedAt" as const,
      value: participation.endsAt,
    }
  }

  return {
    labelKey: "endsAt" as const,
    value: participation.endsAt,
  }
}

function moneyToNumber(value: string) {
  return Number(value)
}

function lotHref(participation: IndexParticipation) {
  return `/auction/${participation.id}`
}

function Label(props: { children: ReactNode }) {
  return (
    <span className="block text-xs font-bold tracking-[1px] text-muted-foreground uppercase">
      {props.children}
    </span>
  )
}

/** Card art of the first item over the hatched stage. */
function BidStage(props: { participation: IndexParticipation; dim: boolean }) {
  const imagePath = props.participation.items[0]?.imagePath

  return (
    <div
      className={cn(
        "flex w-24 shrink-0 items-center border-r-4 border-black px-3 py-4 sm:w-32 sm:px-3.5",
        statusStyles[props.participation.status].stage
      )}
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt=""
          width={imageWidth}
          height={imageHeight}
          sizes={imageSizes}
          className={cn(
            "block h-auto w-full shadow-[0_8px_16px_rgba(0,0,0,0.55)]",
            props.dim && "opacity-75 contrast-[0.9] grayscale-[0.85]"
          )}
        />
      ) : (
        <div aria-hidden="true" className="aspect-59/86 w-full bg-black/30" />
      )}
    </div>
  )
}

export function BidCard(props: { participation: IndexParticipation }) {
  const t = useTranslations("pages./my-bids")
  const format = useFormatter()
  const participation = props.participation
  const schedule = scheduleFor(participation)
  const isLive = participation.status === "LIVE"
  const showsBid = participation.status !== "SCHEDULED"
  const bidAmount = participation.currentBid ?? participation.openingBid

  const shareToken = participation.shareToken
  const showsReceipt = participation.won && shareToken !== null
  const showsAudit = participation.status === "ENDED"
  //* Lots the bidder can no longer win fade out, like closed lots on the home page
  const dim =
    participation.status === "CANCELED" ||
    (participation.status === "ENDED" && !participation.won)

  return (
    <article
      id={`bid-card-${participation.id}`}
      className={cn(
        "flex min-w-0 border-4 bg-card text-card-foreground shadow-hard-8",
        //* The neutral shadow is already yellow in dark mode, so wins pair yellow with red
        participation.won
          ? "border-brand-yellow shadow-brand-red"
          : statusStyles[participation.status].article
      )}
    >
      <BidStage participation={participation} dim={dim} />
      <div className="@container flex min-w-0 flex-1 flex-col gap-4 p-4.5">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-start @2xl:justify-between">
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Tag
                id={`bid-status-${participation.id}`}
                tone={statusTagTone[participation.status]}
              >
                {isLive ? <LiveDot size={7} /> : null}
                {t(`statuses.${participation.status}`)}
              </Tag>
              {participation.won ? (
                <Tag id={`bid-won-${participation.id}`} tone="yellow">
                  <TrophyIcon
                    aria-hidden="true"
                    className="size-3.5"
                    strokeWidth={3}
                    strokeLinecap="square"
                  />
                  {t("won")}
                </Tag>
              ) : null}
            </div>
            <h3
              data-slot="bid-title"
              className="m-0 font-heading text-lg leading-[1.15] font-normal wrap-break-word"
            >
              <Link
                href={lotHref(participation)}
                className="text-inherit no-underline hover:text-red-text"
              >
                {participation.title}
              </Link>
            </h3>
            <p className="m-0 text-sm text-muted-foreground">
              {[
                t("cardCount", { count: participation.items.length }),
                t("participant", {
                  number: String(participation.participantNo),
                }),
                t("bidCount", { count: participation.bidCount }),
              ].join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 @2xl:shrink-0 @2xl:justify-end @2xl:text-right">
            {showsBid ? (
              <p id={`bid-amount-${participation.id}`} className="m-0 min-w-0">
                <Label>{t(bidLabelKey(participation.status))}</Label>{" "}
                <span
                  className={cn(
                    "block font-heading text-2xl leading-[1.1]",
                    participation.status === "ENDED" && "text-red-text"
                  )}
                >
                  <FitAmount>
                    {format.number(moneyToNumber(bidAmount), currencyFormat)}
                  </FitAmount>
                </span>
              </p>
            ) : null}
            <p id={`bid-schedule-${participation.id}`} className="m-0">
              <Label>{t(schedule.labelKey)}</Label>{" "}
              <span className="block font-heading text-[17px] leading-[1.2] whitespace-nowrap">
                {format.dateTime(schedule.value, dateFormat)}
              </span>
            </p>
          </div>
        </div>
        {isLive ? (
          <div className="max-w-sm">
            <LotTimer endsAt={participation.endsAt} />
          </div>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t-3 border-dashed border-input pt-3">
          <Link
            id={`bid-lot-link-${participation.id}`}
            href={lotHref(participation)}
            className={buttonVariants({
              variant: isLive ? "default" : "outline",
              size: "sm",
            })}
          >
            {isLive ? t("placeBid") : t("viewLot")}
          </Link>
          {showsReceipt ? (
            <Link
              id={`bid-receipt-link-${participation.id}`}
              href={`/receipts/${shareToken}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ReceiptTextIcon aria-hidden data-icon="inline-start" />
              {t("viewReceipt")}
            </Link>
          ) : null}
          {showsAudit ? (
            <Link
              id={`bid-audit-link-${participation.id}`}
              href={`/auction/${participation.id}/audit`}
              className={buttonVariants({
                variant: "link",
                className: "min-h-9",
              })}
            >
              <FileSearchIcon aria-hidden data-icon="inline-start" />
              {t("audit")}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
