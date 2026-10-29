"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import Link from "next/link"
import type { ReactNode } from "react"

//* Components imports
import { CheckIcon, ClockIcon } from "@/src/components/auction/auction-icons"
import { BidLock } from "@/src/components/auction/bid-lock"
import { LotGallery } from "@/src/components/auction/lot-gallery"
import {
  LotBreadcrumb,
  LotContents,
  LotHeading,
} from "@/src/components/auction/lot-header"
import { PlaceBidForm } from "@/src/components/auction/place-bid-form"
import { ArrowRightIcon } from "@/src/components/ui/brand"
import { FitAmount } from "@/src/components/utils/money"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import { useLotCountdown } from "@/src/hooks/lots/use-lot-countdown"
import {
  usePublicLotLive,
  type PublicLotLiveStatus,
} from "@/src/hooks/lots/queries/use-public-lot-live"
import { useNow } from "@/src/hooks/use-now"

//* Schema imports
import { userRoleSchema } from "@/src/schemas/user"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { minimumBidCents, moneyToNumber } from "@/src/lib/auction/bid-money"
import { endingSoonMs, formatCountdown } from "@/src/lib/lots/countdown"
import {
  publicLotCountdownTarget,
  viewerPlacedLastBid,
  viewerWasJustOutbid,
} from "@/src/lib/lots/public-lot-room"
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

type PublicLot = ShowLot["lot"]

function itemsByPosition(items: PublicLot["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

function isViewer(
  participantNo: number | null,
  viewerParticipantNo: number | null
) {
  return viewerParticipantNo !== null && participantNo === viewerParticipantNo
}

function isMissingLot(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

function useParticipantName() {
  const t = useTranslations("pages./auction/[id]")

  return (participantNo: number, viewerParticipantNo: number | null) => {
    const number = String(participantNo)

    return isViewer(participantNo, viewerParticipantNo)
      ? t("youWithNumber", { number })
      : t("participant", { number })
  }
}

function SmallLabel(props: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "text-[11px] font-bold tracking-[1px] text-muted-foreground uppercase",
        props.className
      )}
    >
      {props.children}
    </div>
  )
}

function LeadershipBanner(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")

  if (props.room.lot.status !== "LIVE") {
    return null
  }

  if (viewerPlacedLastBid(props.room)) {
    return (
      <div
        id="auction-leadership"
        role="status"
        className="flex -rotate-1 animate-pop items-center gap-2.5 border-3 border-black bg-brand-yellow px-3.5 py-3 font-bold text-brand-ink"
      >
        <CheckIcon />
        {t("youAreWinning")}
      </div>
    )
  }

  if (viewerWasJustOutbid(props.room)) {
    return (
      <div
        id="auction-leadership"
        role="status"
        className="border-3 border-black bg-brand-red px-3.5 py-3 font-bold text-white"
      >
        {t("youWereOutbid")}
      </div>
    )
  }

  return null
}

function LotTimerBar(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")
  const lot = props.room.lot
  const target = publicLotCountdownTarget(lot)
  const remainingMs = useLotCountdown({
    lotId: lot.id,
    serverNow: props.room.serverNow,
    target,
  })
  const counting = target !== null && remainingMs !== null
  const urgent =
    lot.status === "LIVE" && remainingMs !== null && remainingMs < endingSoonMs

  function label() {
    if (lot.status === "SCHEDULED") {
      return t("timer.startsIn")
    }

    if (lot.status === "CANCELED") {
      return t("timer.canceled")
    }

    if (lot.status === "ENDED" || remainingMs === 0) {
      return t("timer.ended")
    }

    return urgent ? t("timer.endingSoon") : t("timer.endsIn")
  }

  return (
    <div
      id={counting ? "auction-countdown" : undefined}
      role="timer"
      className={cn(
        "flex items-center gap-2.5 border-b-4 border-black px-4.5 py-3.5 font-bold tracking-[0.5px] uppercase",
        urgent ? "bg-brand-red text-white" : "bg-brand-ink text-brand-yellow"
      )}
    >
      <ClockIcon />
      <span>{label()}</span>
      {counting ? (
        <>
          {" "}
          <span className="ml-auto font-heading text-[26px] whitespace-nowrap tabular-nums">
            {formatCountdown(remainingMs)}
          </span>
        </>
      ) : null}
    </div>
  )
}

function LotOutcome(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")
  const participantName = useParticipantName()
  const lot = props.room.lot
  const viewerParticipantNo = props.room.viewerParticipantNo
  const note = "border-3 border-input px-3.5 py-3 font-bold"

  if (lot.sold && lot.winnerParticipantNo !== null) {
    return (
      <div
        id="lot-winner"
        data-yours={
          isViewer(lot.winnerParticipantNo, viewerParticipantNo)
            ? "true"
            : "false"
        }
        className="flex items-center gap-2.5 border-3 border-black bg-brand-yellow px-3.5 py-3 font-bold text-brand-ink"
      >
        <CheckIcon />
        <span>
          {t("winner")}:{" "}
          {participantName(lot.winnerParticipantNo, viewerParticipantNo)}
        </span>
      </div>
    )
  }

  if (lot.status === "ENDED" && lot.bidCount === 0) {
    return (
      <p id="lot-ended-empty" className={cn("m-0", note)}>
        {t("endedWithoutBids")}
      </p>
    )
  }

  if (lot.status === "ENDED") {
    return (
      <p id="lot-settling" className={cn("m-0", note)}>
        {t("settling")}
      </p>
    )
  }

  if (lot.status === "CANCELED") {
    return (
      <p id="lot-canceled" className={cn("m-0", note)}>
        {t("canceledNote")}
      </p>
    )
  }

  return null
}

function BidPanel(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const session = useAuthSession()
  const parsedRole = userRoleSchema.safeParse(session.data?.user.role)
  const isBidder = parsedRole.success && parsedRole.data === "BIDDER"
  const isGuest = !session.isPending && session.data == null
  const participantName = useParticipantName()
  const lot = props.room.lot
  const viewerParticipantNo = props.room.viewerParticipantNo
  const viewerIsLeader = isViewer(lot.leaderParticipantNo, viewerParticipantNo)
  const open = lot.status === "SCHEDULED" || lot.status === "LIVE"
  const canOfferBid =
    lot.status === "LIVE" && !viewerIsLeader && !session.isPending

  return (
    <div
      id="bid-panel"
      className="border-4 border-border bg-card shadow-[10px_10px_0_var(--color-brand-red)]"
    >
      <LotTimerBar room={props.room} />
      <div className="flex flex-col gap-5 p-5.5">
        <div className="@container">
          <h2
            id="current-bid-title"
            className="m-0 text-[13px] font-bold tracking-[1px] text-muted-foreground uppercase"
          >
            {open ? t("currentBid") : t("finalBid")}
          </h2>
          <p
            id="current-bid-value"
            className={cn(
              "m-0 font-heading leading-[1.05]",
              lot.currentBid === null
                ? "text-2xl"
                : "text-[clamp(36px,4vw,48px)]"
            )}
          >
            {lot.currentBid === null ? (
              t("noCurrentBid")
            ) : (
              <FitAmount>
                {format.number(moneyToNumber(lot.currentBid), currencyFormat)}
              </FitAmount>
            )}
          </p>
          {lot.leaderParticipantNo !== null ? (
            <p
              id="lot-leader"
              data-yours={viewerIsLeader ? "true" : "false"}
              className="mt-1 mb-0 text-sm text-muted-foreground"
            >
              {t("by")}{" "}
              <strong className="text-foreground">
                {participantName(lot.leaderParticipantNo, viewerParticipantNo)}
              </strong>{" "}
              · {t("bidCount", { count: lot.bidCount })}
            </p>
          ) : null}
          {viewerParticipantNo !== null ? (
            <p
              id="viewer-participant"
              className="mt-1 mb-0 text-sm text-muted-foreground"
            >
              {t("yourNumber")}{" "}
              <strong className="text-foreground">
                #{viewerParticipantNo}
              </strong>
            </p>
          ) : null}
        </div>
        {open ? (
          <div className="flex flex-wrap gap-0.75 border-3 border-input bg-input">
            <div className="min-w-fit flex-1 bg-card px-3 py-2.5">
              <SmallLabel>{t("minimumIncrement")}</SmallLabel>
              <div className="font-heading text-lg">
                {format.number(moneyToNumber(lot.minIncrement), currencyFormat)}
              </div>
            </div>
            <div className="min-w-fit flex-1 bg-brand-ink px-3 py-2.5 text-brand-yellow">
              <SmallLabel className="text-white">{t("minimumBid")}</SmallLabel>
              <div id="minimum-bid-value" className="font-heading text-lg">
                {format.number(minimumBidCents(lot) / 100, currencyFormat)}
              </div>
            </div>
          </div>
        ) : null}
        <LeadershipBanner room={props.room} />
        <LotOutcome room={props.room} />
        {canOfferBid && isBidder ? <PlaceBidForm lot={lot} /> : null}
        {canOfferBid && !isBidder ? (
          <BidLock
            id={isGuest ? "guest-bid-lock" : "auctioneer-bid-lock"}
            message={isGuest ? t("guestCannotBid") : t("auctioneerCannotBid")}
            actionHref={isGuest ? "/sign-in" : undefined}
            actionLabel={isGuest ? t("signInToBid") : undefined}
          />
        ) : null}
      </div>
    </div>
  )
}

function BidHistory(props: {
  lot: PublicLot
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

function AuctionConnection(props: { liveStatus: PublicLotLiveStatus }) {
  const t = useTranslations("pages./auction/[id]")
  const banner = "mb-5 border-3 border-black px-4 py-3 font-bold"

  if (props.liveStatus === "reconnecting") {
    return (
      <p
        id="auction-connection"
        role="status"
        className={cn(banner, "bg-brand-yellow text-brand-ink")}
      >
        {t("reconnecting")}
      </p>
    )
  }

  if (props.liveStatus === "unavailable") {
    return (
      <p
        id="auction-connection"
        role="alert"
        className={cn(banner, "bg-brand-red text-white")}
      >
        {t("connectionProblem")}
      </p>
    )
  }

  return null
}

function AuctionRoomDetails(props: {
  room: ShowLot
  liveStatus: PublicLotLiveStatus
}) {
  const t = useTranslations("pages./auction/[id]")
  const lot = props.room.lot
  const items = itemsByPosition(lot.items)

  return (
    <div id="auction-room">
      <AuctionConnection liveStatus={props.liveStatus} />
      <LotBreadcrumb lot={lot} />
      <LotHeading lot={lot} />
      <div className="flex flex-wrap items-start gap-10">
        <section
          aria-label={t("lotCards")}
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-9"
        >
          <LotGallery items={items} />
          <LotContents lot={lot} items={items} />
        </section>
        <aside
          aria-label={t("bidsLabel")}
          className="flex min-w-0 flex-[1_1_380px] flex-col gap-8"
        >
          <BidPanel room={props.room} />
          <BidHistory
            lot={lot}
            viewerParticipantNo={props.room.viewerParticipantNo}
          />
        </aside>
      </div>
    </div>
  )
}

export function AuctionRoom(props: { id: string }) {
  const t = useTranslations("pages./auction/[id]")
  const lotQuery = useShowLot({ id: props.id })
  const liveStatus = usePublicLotLive(props.id)

  if (lotQuery.isError) {
    return (
      <p id="auction-room-error" role="alert">
        {isMissingLot(lotQuery.error) ? t("notFound") : t("error")}
      </p>
    )
  }

  if (!lotQuery.data) {
    if (lotQuery.fetchStatus === "idle") {
      return <p id="auction-room-missing">{t("notFound")}</p>
    }

    return <p id="auction-room-loading">{t("loading")}</p>
  }

  return <AuctionRoomDetails room={lotQuery.data} liveStatus={liveStatus} />
}
