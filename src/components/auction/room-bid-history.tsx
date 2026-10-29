"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import { ArrowRightIcon } from "@/src/components/ui/brand"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import { useParticipantName } from "@/src/hooks/lots/use-participant-name"
import { useNow } from "@/src/hooks/use-now"

//* Local imports
import { moneyToNumber } from "@/src/lib/auction/bid-money"
import { isViewer } from "@/src/lib/lots/public-lot-room"
import { cn } from "@/src/lib/utils"

//* The history card shows the latest bids; the audit page has all of them
const recentBidsLimit = 8

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const bidTimeFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

const avatarTones = [
  "bg-brand-red text-white",
  "bg-brand-yellow text-brand-ink",
  "bg-brand-ink text-white",
]

export function RoomBidHistory(props: {
  lot: ShowLot["lot"]
  viewerParticipantNo: number | null
}) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const participantName = useParticipantName()
  const now = useNow(15_000)
  //* Newest first, like the live feed
  const recentBids = [...props.lot.bids].reverse().slice(0, recentBidsLimit)

  return (
    <div
      id="bid-history"
      className="border-4 border-border bg-card shadow-hard-8"
    >
      <div className="flex items-center justify-between gap-3 border-b-4 border-black bg-brand-ink px-4.5 py-4 text-white">
        <h2
          id="bid-history-title"
          className="m-0 font-heading text-xl font-normal"
        >
          {t("bidHistory")}
        </h2>
        {/* The empty message below already says there are no bids */}
        {props.lot.bidCount > 0 ? (
          <span className="text-sm font-bold whitespace-nowrap text-brand-yellow">
            {t("bidCount", { count: props.lot.bidCount })}
          </span>
        ) : null}
      </div>
      {recentBids.length === 0 ? (
        <p
          id="bid-history-empty"
          className="m-0 px-4.5 py-6 text-muted-foreground"
        >
          {t("emptyBids")}
        </p>
      ) : (
        <>
          <ol id="auction-bids" className="m-0 list-none p-0">
            {recentBids.map((bid, index) => {
              const yours = isViewer(
                bid.participantNo,
                props.viewerParticipantNo
              )
              const top = index === 0

              return (
                <li
                  key={bid.sequence}
                  id={`auction-bid-${bid.sequence}`}
                  data-yours={yours ? "true" : "false"}
                  className={cn(
                    "flex items-center gap-3 border-b-3 border-line-soft px-4.5 py-3",
                    yours ? "bg-mine-row" : "bg-card"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-9 flex-none items-center justify-center border-2 border-black font-heading text-[13px]",
                      yours
                        ? "bg-brand-yellow text-brand-ink"
                        : avatarTones[bid.participantNo % avatarTones.length]
                    )}
                  >
                    #{bid.participantNo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
                      {participantName(
                        bid.participantNo,
                        props.viewerParticipantNo
                      )}
                      {top ? (
                        <span className="bg-brand-red px-1.5 py-0.5 font-heading text-[11px] font-normal text-white">
                          {t("topBid")}
                        </span>
                      ) : null}
                    </div>
                    <time
                      dateTime={bid.createdAt.toISOString()}
                      title={format.dateTime(bid.createdAt, bidTimeFormat)}
                      className="text-[13px] text-muted-foreground"
                    >
                      {format.relativeTime(bid.createdAt, now)}
                    </time>
                  </div>
                  <span
                    className={cn(
                      "font-heading text-[17px] whitespace-nowrap",
                      top && "text-red-text"
                    )}
                  >
                    {format.number(moneyToNumber(bid.amount), currencyFormat)}
                  </span>
                </li>
              )
            })}
          </ol>
          <Link
            id="bid-history-full"
            href={`/auction/${props.lot.id}/audit`}
            className="flex min-h-12 items-center justify-center gap-2 p-3.5 font-heading text-sm text-foreground no-underline hover:text-red-text"
          >
            {t("fullHistory")}
            <ArrowRightIcon size={16} />
          </Link>
        </>
      )}
    </div>
  )
}
