"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import type { ReactNode } from "react"

//* Components imports
import { CheckIcon, ClockIcon } from "@/src/components/auction/auction-icons"
import { BidLock } from "@/src/components/auction/bid-lock"
import { PlaceBidForm } from "@/src/components/auction/place-bid-form"
import { FitAmount } from "@/src/components/utils/money"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import { useLotCountdown } from "@/src/hooks/lots/use-lot-countdown"
import { useParticipantName } from "@/src/hooks/lots/use-participant-name"

//* Schema imports
import { userRoleSchema } from "@/src/schemas/user"

//* Local imports
import { minimumBidCents, moneyToNumber } from "@/src/lib/auction/bid-money"
import { endingSoonMs, formatCountdown } from "@/src/lib/lots/countdown"
import {
  isViewer,
  publicLotCountdownTarget,
  resolveBidPanelState,
  viewerPlacedLastBid,
  viewerWasJustOutbid,
  type BidViewer,
} from "@/src/lib/lots/public-lot-room"
import { cn } from "@/src/lib/utils"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

function useBidViewer(): BidViewer {
  const session = useAuthSession()

  if (session.isPending) {
    return "pending"
  }

  if (session.data == null) {
    return "guest"
  }

  const parsedRole = userRoleSchema.safeParse(session.data.user.role)

  return parsedRole.success && parsedRole.data === "BIDDER"
    ? "bidder"
    : "auctioneer"
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

function CurrentBid(props: { room: ShowLot; open: boolean }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const participantName = useParticipantName()
  const lot = props.room.lot
  const viewerParticipantNo = props.room.viewerParticipantNo
  const viewerIsLeader = isViewer(lot.leaderParticipantNo, viewerParticipantNo)

  return (
    <div className="@container">
      <h2
        id="current-bid-title"
        className="m-0 text-[13px] font-bold tracking-[1px] text-muted-foreground uppercase"
      >
        {props.open ? t("currentBid") : t("finalBid")}
      </h2>
      <p
        id="current-bid-value"
        className={cn(
          "m-0 font-heading leading-[1.05]",
          lot.currentBid === null ? "text-2xl" : "text-[clamp(36px,4vw,48px)]"
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
          <strong className="text-foreground">#{viewerParticipantNo}</strong>
        </p>
      ) : null}
    </div>
  )
}

function BidLimits(props: { lot: ShowLot["lot"] }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()

  return (
    <div className="flex flex-wrap gap-0.75 border-3 border-input bg-input">
      <div className="min-w-fit flex-1 bg-card px-3 py-2.5">
        <SmallLabel>{t("minimumIncrement")}</SmallLabel>
        <div className="font-heading text-lg">
          {format.number(moneyToNumber(props.lot.minIncrement), currencyFormat)}
        </div>
      </div>
      <div className="min-w-fit flex-1 bg-brand-ink px-3 py-2.5 text-brand-yellow">
        <SmallLabel className="text-white">{t("minimumBid")}</SmallLabel>
        <div id="minimum-bid-value" className="font-heading text-lg">
          {format.number(minimumBidCents(props.lot) / 100, currencyFormat)}
        </div>
      </div>
    </div>
  )
}

function BidAction(props: { room: ShowLot; viewer: BidViewer }) {
  const t = useTranslations("pages./auction/[id]")

  switch (resolveBidPanelState(props.room, props.viewer)) {
    case "bidder":
      return <PlaceBidForm lot={props.room.lot} />
    case "guest":
      return (
        <BidLock
          id="guest-bid-lock"
          message={t("guestCannotBid")}
          actionHref="/sign-in"
          actionLabel={t("signInToBid")}
        />
      )
    case "auctioneer":
      return (
        <BidLock id="auctioneer-bid-lock" message={t("auctioneerCannotBid")} />
      )
    case "none":
      return null
  }
}

export function BidPanel(props: { room: ShowLot }) {
  const viewer = useBidViewer()
  const status = props.room.lot.status
  const open = status === "SCHEDULED" || status === "LIVE"

  return (
    <div
      id="bid-panel"
      className="border-4 border-border bg-card shadow-[10px_10px_0_var(--color-brand-red)]"
    >
      <LotTimerBar room={props.room} />
      <div className="flex flex-col gap-5 p-5.5">
        <CurrentBid room={props.room} open={open} />
        {open ? <BidLimits lot={props.room.lot} /> : null}
        <LeadershipBanner room={props.room} />
        <LotOutcome room={props.room} />
        <BidAction room={props.room} viewer={viewer} />
      </div>
    </div>
  )
}
