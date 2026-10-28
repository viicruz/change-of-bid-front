"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { LockIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { type SubmitEvent } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

//* Components imports
import { YugiohCard } from "@/src/components/cards/yugioh-card"
import { Badge } from "@/src/components/ui/badge"
import { Button, buttonVariants } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"
import {
  storeBidSchema,
  useStoreBid,
} from "@/src/hooks/lots/mutations/use-store-bid"
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import { useLotCountdown } from "@/src/hooks/lots/use-lot-countdown"
import {
  usePublicLotLive,
  type PublicLotLiveStatus,
} from "@/src/hooks/lots/queries/use-public-lot-live"

//* Schema imports
import { userRoleSchema } from "@/src/schemas/user"

//* Local imports
import { ApiError } from "@/src/lib/api"
import {
  publicLotCountdownTarget,
  viewerPlacedLastBid,
  viewerWasJustOutbid,
} from "@/src/lib/lots/public-lot-room"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const scheduleFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const minuteText = String(minutes).padStart(2, "0")
  const secondText = String(seconds).padStart(2, "0")

  if (hours > 0) {
    return `${String(hours)}:${minuteText}:${secondText}`
  }

  return `${minuteText}:${secondText}`
}

const statusLabelKey = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  ENDED: "closed",
  CANCELED: "canceled",
} as const

type PublicLot = ShowLot["lot"]

function moneyToNumber(value: string) {
  return Number(value)
}

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

function MoneyLine(props: { label: string; amount: string }) {
  const format = useFormatter()

  return (
    <p>
      <span className="text-muted-foreground">{props.label}</span>{" "}
      {format.number(moneyToNumber(props.amount), currencyFormat)}
    </p>
  )
}

function ParticipantLine(props: {
  id: string
  label: string
  participantNo: number
  viewerParticipantNo: number | null
}) {
  const t = useTranslations("pages./auction/[id]")
  const yours = isViewer(props.participantNo, props.viewerParticipantNo)

  return (
    <p id={props.id} data-yours={yours ? "true" : "false"}>
      <span className="text-muted-foreground">{props.label}</span>{" "}
      {props.participantNo}
      {yours ? <span> {t("you")}</span> : null}
    </p>
  )
}

function LotItemCard(props: { item: PublicLot["items"][number] }) {
  const item = props.item

  return (
    <li className="min-w-0">
      <YugiohCard
        id={`lot-item-${item.id}`}
        name={item.cardName}
        imageUrl={item.imagePath}
        size="lg"
        amount={item.quantity}
        quantityId={`lot-item-quantity-${item.id}`}
      />
    </li>
  )
}

function LotItems(props: { items: PublicLot["items"] }) {
  const items = itemsByPosition(props.items)

  return (
    <ul
      id="lot-items"
      className="grid grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-3"
    >
      {items.map((item) => (
        <LotItemCard key={item.id} item={item} />
      ))}
    </ul>
  )
}

const placeBidSchema = storeBidSchema.pick({ amount: true })

type PlaceBidValues = z.infer<typeof placeBidSchema>

const bidErrorMessageKey = {
  NOT_BIDDER: "bidErrors.NOT_BIDDER",
  LOT_NOT_FOUND: "bidErrors.LOT_NOT_FOUND",
  BID_BELOW_MINIMUM: "bidErrors.BID_BELOW_MINIMUM",
  INSUFFICIENT_BALANCE: "bidErrors.INSUFFICIENT_BALANCE",
  ALREADY_LEADER: "bidErrors.ALREADY_LEADER",
  LOT_NOT_STARTED: "bidErrors.LOT_NOT_STARTED",
  LOT_ENDED: "bidErrors.LOT_ENDED",
  LOT_CANCELED: "bidErrors.LOT_CANCELED",
} as const

type BidErrorCode = keyof typeof bidErrorMessageKey

function isBidErrorCode(code: string): code is BidErrorCode {
  return code in bidErrorMessageKey
}

function readBidErrorCode(error: unknown) {
  if (
    error instanceof ApiError &&
    typeof error.body === "object" &&
    error.body !== null &&
    "code" in error.body &&
    typeof error.body.code === "string" &&
    isBidErrorCode(error.body.code)
  ) {
    return error.body.code
  }

  return null
}

type BidLockProps = {
  id: string
  message: string
  actionHref?: string
  actionLabel?: string
}

function BidLock(props: BidLockProps) {
  const t = useTranslations("pages./auction/[id]")

  return (
    <div id={props.id} className="relative">
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none flex flex-col gap-4 blur-sm select-none"
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("bidValue")}</span>
          <div className="h-13 border-3 border-input bg-field" />
        </div>
        <div className="flex h-13 items-center justify-center border-4 border-black bg-primary px-4 text-lg text-primary-foreground">
          {t("placeBid")}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-4 text-center">
        <LockIcon aria-hidden="true" className="size-6" />
        <p id={`${props.id}-message`} className="text-sm font-medium">
          {props.message}
        </p>
        {props.actionHref && props.actionLabel ? (
          <a
            id={`${props.id}-action`}
            href={props.actionHref}
            className={buttonVariants({
              size: "sm",
              className: "no-underline",
            })}
          >
            {props.actionLabel}
          </a>
        ) : null}
      </div>
    </div>
  )
}

function PlaceBidForm(props: { lotId: string }) {
  const t = useTranslations("pages./auction/[id]")
  const translateError = useErrorTranslations()
  const storeBid = useStoreBid()
  const form = useForm<PlaceBidValues>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      amount: "",
    },
  })
  const amountError = form.formState.errors.amount?.message
  const requestErrorCode = storeBid.isError
    ? readBidErrorCode(storeBid.error)
    : null
  const describedBy = [
    amountError ? "bid-amount-error" : null,
    storeBid.isError ? "place-bid-error" : null,
  ]
    .filter((id) => id !== null)
    .join(" ")

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    storeBid.reset()
    void form.handleSubmit((values) => {
      storeBid.mutate(
        {
          id: props.lotId,
          amount: values.amount,
        },
        {
          onSuccess: () => {
            form.reset({ amount: "" })
          },
        }
      )
    })(event)
  }

  return (
    <form
      id="place-bid-form"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="bid-amount">{t("bidValue")}</Label>
        <Input
          id="bid-amount"
          type="text"
          inputMode="decimal"
          placeholder={t("bidValue")}
          autoComplete="off"
          aria-invalid={amountError || storeBid.isError ? true : undefined}
          aria-describedby={describedBy.length > 0 ? describedBy : undefined}
          disabled={storeBid.isPending}
          className="border-foreground/30 bg-background dark:border-foreground/30 dark:bg-background"
          {...form.register("amount", {
            onChange: () => {
              if (storeBid.isError) {
                storeBid.reset()
              }
            },
          })}
        />
        {amountError ? (
          <p id="bid-amount-error" className="text-sm text-destructive">
            {translateError(amountError)}
          </p>
        ) : null}
      </div>
      {storeBid.isError ? (
        <p
          id="place-bid-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {requestErrorCode
            ? t(bidErrorMessageKey[requestErrorCode])
            : t("bidError")}
        </p>
      ) : null}
      <Button id="place-bid" type="submit" disabled={storeBid.isPending}>
        {storeBid.isPending ? t("placingBid") : t("placeBid")}
      </Button>
    </form>
  )
}

function LeadershipLine(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")
  const lot = props.room.lot

  if (lot.status !== "LIVE") {
    return null
  }

  if (viewerPlacedLastBid(props.room)) {
    return <p id="auction-leadership">{t("youAreWinning")}</p>
  }

  if (viewerWasJustOutbid(props.room)) {
    return <p id="auction-leadership">{t("youWereOutbid")}</p>
  }

  if (lot.leaderParticipantNo === null) {
    return null
  }

  return (
    <p id="auction-leadership">
      {t("bidder", { number: String(lot.leaderParticipantNo) })}
    </p>
  )
}

function BidPanel(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const session = useAuthSession()
  const parsedRole = userRoleSchema.safeParse(session.data?.user.role)
  const isBidder = parsedRole.success && parsedRole.data === "BIDDER"
  const isGuest = !session.isPending && session.data == null
  const lot = props.room.lot
  const viewerParticipantNo = props.room.viewerParticipantNo
  const viewerIsLeader =
    viewerParticipantNo !== null &&
    lot.leaderParticipantNo === viewerParticipantNo
  const canOfferBid =
    lot.status === "LIVE" && !viewerIsLeader && !session.isPending

  return (
    <Card.Root id="bid-panel">
      <Card.Header>
        <Card.Title>
          <h3 id="current-bid-title">{t("currentBid")}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <p id="current-bid-value" className="font-heading text-2xl font-medium">
          {lot.currentBid === null
            ? t("noCurrentBid")
            : format.number(moneyToNumber(lot.currentBid), currencyFormat)}
        </p>
        <LeadershipLine room={props.room} />
        {lot.leaderParticipantNo !== null ? (
          <ParticipantLine
            id="lot-leader"
            label={t("leader")}
            participantNo={lot.leaderParticipantNo}
            viewerParticipantNo={viewerParticipantNo}
          />
        ) : null}
        {viewerParticipantNo !== null ? (
          <p id="viewer-participant">
            <span className="text-muted-foreground">{t("yourNumber")}</span>{" "}
            {viewerParticipantNo}
          </p>
        ) : null}
        {lot.status === "ENDED" && lot.bidCount === 0 ? (
          <p id="lot-ended-empty">{t("endedWithoutBids")}</p>
        ) : null}
        {lot.status === "ENDED" && lot.bidCount > 0 && !lot.sold ? (
          <p id="lot-settling">{t("settling")}</p>
        ) : null}
        {lot.sold && lot.winnerParticipantNo !== null ? (
          <ParticipantLine
            id="lot-winner"
            label={t("winner")}
            participantNo={lot.winnerParticipantNo}
            viewerParticipantNo={viewerParticipantNo}
          />
        ) : null}
        {canOfferBid && isBidder ? <PlaceBidForm lotId={lot.id} /> : null}
        {canOfferBid && !isBidder ? (
          <BidLock
            id={isGuest ? "guest-bid-lock" : "auctioneer-bid-lock"}
            message={isGuest ? t("guestCannotBid") : t("auctioneerCannotBid")}
            actionHref={isGuest ? "/sign-in" : undefined}
            actionLabel={isGuest ? t("signInToBid") : undefined}
          />
        ) : null}
      </Card.Content>
    </Card.Root>
  )
}

function BidHistory(props: {
  bids: PublicLot["bids"]
  viewerParticipantNo: number | null
}) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()

  return (
    <Card.Root id="bid-history" className="flex-1">
      <Card.Header>
        <Card.Title>
          <h3 id="bid-history-title">{t("bidHistory")}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {props.bids.length === 0 ? (
          <p id="bid-history-empty">{t("emptyBids")}</p>
        ) : (
          <ul id="auction-bids" className="flex flex-col gap-3">
            {props.bids.map((bid) => {
              const bidIsViewer = isViewer(
                bid.participantNo,
                props.viewerParticipantNo
              )

              return (
                <li
                  key={bid.sequence}
                  id={`auction-bid-${bid.sequence}`}
                  data-yours={bidIsViewer ? "true" : "false"}
                  className={
                    bidIsViewer
                      ? "flex flex-col gap-1 rounded-lg bg-primary/10 px-3 py-2"
                      : "flex flex-col gap-1 px-3 py-2"
                  }
                >
                  <p>
                    <span className="text-muted-foreground">
                      {t("participant")}
                    </span>{" "}
                    {bid.participantNo}
                    {bidIsViewer ? <span> {t("you")}</span> : null}
                  </p>
                  <p>
                    {format.number(moneyToNumber(bid.amount), currencyFormat)}
                  </p>
                  <p>{format.dateTime(bid.createdAt, scheduleFormat)}</p>
                </li>
              )
            })}
          </ul>
        )}
      </Card.Content>
    </Card.Root>
  )
}

function LotCountdown(props: { room: ShowLot }) {
  const t = useTranslations("pages./auction/[id]")
  const target = publicLotCountdownTarget(props.room.lot)
  const remainingMs = useLotCountdown({
    lotId: props.room.lot.id,
    serverNow: props.room.serverNow,
    target,
  })

  if (target === null || remainingMs === null) {
    return null
  }

  const time = formatCountdown(remainingMs)
  const label =
    props.room.lot.status === "SCHEDULED"
      ? t("countdownStarts", { time })
      : t("countdownEnds", { time })

  return <p id="auction-countdown">{label}</p>
}

function AuctionConnection(props: { liveStatus: PublicLotLiveStatus }) {
  const t = useTranslations("pages./auction/[id]")

  if (props.liveStatus === "reconnecting") {
    return (
      <p id="auction-connection" role="status">
        {t("reconnecting")}
      </p>
    )
  }

  if (props.liveStatus === "unavailable") {
    return (
      <p id="auction-connection" role="alert">
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
  const format = useFormatter()
  const lot = props.room.lot

  return (
    <section
      id="auction-room"
      className="flex w-full flex-col gap-4 rounded-xl p-6 ring-1 ring-foreground/10"
      aria-labelledby="auction-room-name"
    >
      <AuctionConnection liveStatus={props.liveStatus} />
      <div
        id="auction-room-header"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 ring-foreground/10"
      >
        <h2 id="auction-room-name" className="font-heading text-xl font-medium">
          {lot.title}
        </h2>
        <Badge id="auction-room-status" variant="secondary">
          {t(`statuses.${statusLabelKey[lot.status]}`)}
        </Badge>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card.Root id="lot-info" className="h-full">
          <Card.Header>
            <Card.Title>
              <h3 id="lot-info-title">{t("lotInfo")}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            {lot.description ? (
              <p id="lot-description">
                <span className="text-muted-foreground">
                  {t("lotDescription")}
                </span>{" "}
                {lot.description}
              </p>
            ) : null}
            <div id="lot-summary" className="flex flex-col gap-1">
              <MoneyLine label={t("openingBid")} amount={lot.openingBid} />
              <MoneyLine
                label={t("minimumIncrement")}
                amount={lot.minIncrement}
              />
              <p>
                <span className="text-muted-foreground">{t("startsAt")}</span>{" "}
                {format.dateTime(lot.startsAt, scheduleFormat)}
              </p>
              <p>
                <span className="text-muted-foreground">{t("endsAt")}</span>{" "}
                {format.dateTime(lot.endsAt, scheduleFormat)}
              </p>
              <LotCountdown room={props.room} />
            </div>
            <LotItems items={lot.items} />
          </Card.Content>
        </Card.Root>
        <div className="flex h-full flex-col gap-4">
          <BidPanel room={props.room} />
          <BidHistory
            bids={lot.bids}
            viewerParticipantNo={props.room.viewerParticipantNo}
          />
        </div>
      </div>
    </section>
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
