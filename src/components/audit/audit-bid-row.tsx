"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Hooks imports
import type { ShowLotAudit } from "@/src/hooks/lots/queries/use-show-lot-audit"

//* Lib imports
import { cn } from "@/src/lib/utils"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

const avatarTones = [
  "bg-brand-red text-white",
  "bg-brand-yellow text-brand-ink",
  "bg-brand-ink text-white",
]

type AuditBid = ShowLotAudit["audit"]["bids"][number]

function moneyToNumber(value: string) {
  return Number(value)
}

export function AuditBidRow(props: { bid: AuditBid; last: boolean }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const format = useFormatter()
  const bid = props.bid

  return (
    <li
      id={`audit-bid-${bid.sequence}`}
      className="flex items-center gap-3 border-b-3 border-line-soft px-4.5 py-3 last:border-b-0"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 flex-none items-center justify-center border-2 border-black font-heading text-[13px]",
          avatarTones[bid.participantNo % avatarTones.length]
        )}
      >
        #{bid.participantNo}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
          {t("participant")} #{bid.participantNo}
          {props.last ? (
            <span className="bg-brand-red px-1.5 py-0.5 font-heading text-[11px] font-normal text-white">
              {t("lastBid")}
            </span>
          ) : null}
        </div>
        <div className="text-[13px] text-muted-foreground">
          {t("sequence", { number: String(bid.sequence) })} ·{" "}
          <time dateTime={bid.createdAt.toISOString()}>
            {format.dateTime(bid.createdAt, dateFormat)}
          </time>
        </div>
      </div>
      <span
        className={cn(
          "font-heading text-[17px] whitespace-nowrap",
          props.last && "text-red-text"
        )}
      >
        {format.number(moneyToNumber(bid.amount), currencyFormat)}
      </span>
    </li>
  )
}
