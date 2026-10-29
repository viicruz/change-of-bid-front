"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { LockIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { useState, type ReactNode, type SubmitEvent } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

//* Components imports
import { LotItemList } from "@/src/components/cards/lot-item-list"
import { lotSectionAnchors } from "@/src/components/home/lot-section"
import { ArrowRightIcon, LiveDot, Tag } from "@/src/components/ui/brand"
import { Button, buttonVariants, press } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { FitAmount } from "@/src/components/utils/money"

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
import { useNow } from "@/src/hooks/use-now"

//* Schema imports
import { userRoleSchema } from "@/src/schemas/user"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { endingSoonMs, formatCountdown } from "@/src/lib/lots/countdown"
import {
  publicLotCountdownTarget,
  viewerPlacedLastBid,
  viewerWasJustOutbid,
} from "@/src/lib/lots/public-lot-room"
import { cn } from "@/src/lib/utils"

const imageWidth = 421
const imageHeight = 614

//* The history card shows the latest bids; the audit page has all of them
const recentBidsLimit = 8

//* Quick bids add 1, 2 and 5 minimum increments over the current bid
const quickBidSteps = [1, 2, 5]

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const incrementFormat = {
  maximumFractionDigits: 2,
} as const

const bidTimeFormat = {
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

const avatarTones = [
  "bg-brand-red text-white",
  "bg-brand-yellow text-brand-ink",
  "bg-brand-ink text-white",
]

type PublicLot = ShowLot["lot"]
type PublicLotItem = PublicLot["items"][number]

function moneyToNumber(value: string) {
  return Number(value)
}

//* Bid math runs in cents so increments never pick up float noise
function moneyToCents(value: string) {
  return Math.round(Number(value) * 100)
}

function centsToMoney(cents: number) {
  return (cents / 100).toFixed(2)
}

function minimumBidCents(lot: PublicLot) {
  if (lot.currentBid === null) {
    return moneyToCents(lot.openingBid)
  }

  return moneyToCents(lot.currentBid) + moneyToCents(lot.minIncrement)
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

function useParticipantName() {
  const t = useTranslations("pages./auction/[id]")

  return (participantNo: number, viewerParticipantNo: number | null) => {
    const number = String(participantNo)

    return isViewer(participantNo, viewerParticipantNo)
      ? t("youWithNumber", { number })
      : t("participant", { number })
  }
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="square"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

function GavelIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
    >
      <path d="M13 2l8 8-3 3-8-8z" />
      <path d="M11.5 9.5L4 17l3 3 7.5-7.5" />
      <path d="M3 22h10" />
    </svg>
  )
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

function LotBreadcrumb(props: { lot: PublicLot }) {
  const t = useTranslations("pages./auction/[id]")
  const status = props.lot.status

  return (
    <nav aria-label={t("breadcrumb.label")} className="mb-5">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm font-bold tracking-[0.5px] text-muted-foreground uppercase">
        <li>
          <Link href="/" className="text-muted-foreground no-underline">
            {t("breadcrumb.auctions")}
          </Link>
        </li>
        {/* Canceled lots have no section on the home page */}
        {status === "CANCELED" ? null : (
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link
              href={`/#${lotSectionAnchors[status]}`}
              className="text-muted-foreground no-underline"
            >
              {t(`statuses.${statusLabelKey[status]}`)}
            </Link>
          </li>
        )}
        <li className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="wrap-break-word text-foreground">
            {props.lot.title}
          </span>
        </li>
      </ol>
    </nav>
  )
}

function LotHeading(props: { lot: PublicLot }) {
  const t = useTranslations("pages./auction/[id]")
  const lot = props.lot
  const totalCards = lot.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <Tag id="auction-room-status" tone={statusTagTone[lot.status]}>
          {lot.status === "LIVE" ? <LiveDot /> : null}
          {t(`statuses.${statusLabelKey[lot.status]}`)}
        </Tag>
        <Tag tone="dark">{t("cardCount", { count: totalCards })}</Tag>
      </div>
      <h1 id="auction-room-name" className="m-0 type-h1 wrap-break-word">
        {lot.title}
      </h1>
    </div>
  )
}

function LotGallery(props: { items: PublicLotItem[] }) {
  const t = useTranslations("pages./auction/[id]")
  const [selectedIndex, setSelectedIndex] = useState(0)
  //* A live update can remove items: keep the selection inside the list
  const index = Math.min(selectedIndex, props.items.length - 1)
  const selected = props.items[index]

  if (!selected) {
    return null
  }

  const showsThumbnails = props.items.length > 1

  return (
    <div className="border-4 border-border bg-card shadow-hard-8">
      <div
        className={cn(
          "relative flex justify-center bg-stage bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.10)_0_2px,transparent_2px_18px)] p-[clamp(24px,4vw,44px)]",
          showsThumbnails && "border-b-4 border-border"
        )}
      >
        <Image
          src={selected.imagePath}
          alt={t("cardAlt", { name: selected.cardName })}
          width={imageWidth}
          height={imageHeight}
          sizes="330px"
          loading="eager"
          fetchPriority="high"
          className="block h-auto w-full max-w-82.5 border-3 border-black shadow-[10px_10px_0_var(--color-brand-red)]"
        />
        <span className="absolute top-0 right-0 border-b-4 border-l-4 border-black bg-brand-yellow px-3.5 py-2 font-heading text-lg text-brand-ink">
          <span className="sr-only">{t("quantity")}: </span>×{selected.quantity}
        </span>
        {showsThumbnails ? (
          <span className="absolute bottom-0 left-0 border-t-3 border-black bg-brand-ink px-3 py-2 text-[13px] font-bold tracking-[1px] text-white uppercase">
            {t("position", {
              current: String(index + 1),
              total: String(props.items.length),
            })}
          </span>
        ) : null}
      </div>
      {/* Four thumbnails fit side by side; bigger lots scroll sideways.
          The top padding leaves room for the quantity badges */}
      {showsThumbnails ? (
        <div className="flex snap-x gap-3.5 overflow-x-auto px-4 pt-5 pb-4">
          {props.items.map((item, itemIndex) => {
            const pressed = itemIndex === index

            return (
              <button
                key={item.id}
                type="button"
                aria-label={t("viewCard", { name: item.cardName })}
                aria-pressed={pressed}
                onClick={() => setSelectedIndex(itemIndex)}
                className={cn(
                  press,
                  "relative w-[calc((100%-3*0.875rem)/4)] flex-none snap-start rounded-none border-3 p-1.5",
                  pressed
                    ? "border-black bg-brand-yellow shadow-hard-4 shadow-brand-red"
                    : "border-input bg-card shadow-hard-3"
                )}
              >
                <Image
                  src={item.imagePath}
                  alt=""
                  width={imageWidth}
                  height={imageHeight}
                  sizes="(min-width: 1280px) 160px, 22vw"
                  className="block h-auto w-full"
                />
                <span
                  aria-hidden="true"
                  className="absolute -top-2.5 -right-2.5 border-3 border-black bg-brand-yellow px-1.75 py-0.5 font-heading text-[13px] text-brand-ink"
                >
                  ×{item.quantity}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function LotContents(props: { lot: PublicLot; items: PublicLotItem[] }) {
  const t = useTranslations("pages./auction/[id]")

  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 type-h2">{t("whatsIn")}</h2>
      {props.lot.description ? (
        <p
          id="lot-description"
          className="m-0 max-w-170 text-base leading-[1.55] whitespace-pre-line text-muted-foreground"
        >
          {props.lot.description}
        </p>
      ) : null}
      <LotItemList idPrefix="lot-item" items={props.items} />
    </div>
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
          <span className="text-sm font-medium">{t("yourBid")}</span>
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

function PlaceBidForm(props: { lot: PublicLot }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
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
  const invalid = Boolean(amountError) || storeBid.isError
  const describedBy = [
    amountError ? "bid-amount-error" : null,
    storeBid.isError ? "place-bid-error" : null,
  ]
    .filter((id) => id !== null)
    .join(" ")
  const minimumCents = minimumBidCents(props.lot)
  const baseCents = moneyToCents(props.lot.currentBid ?? props.lot.openingBid)
  const incrementCents = moneyToCents(props.lot.minIncrement)
  //* Without bids the first quick bid is the opening bid itself
  const quickBids = quickBidSteps.map(
    (step) => minimumCents + incrementCents * (step - 1)
  )
  //* From R$ 10.000,00 up three amounts no longer fit side by side, so each takes a row
  const stackQuickBids = quickBids.some(
    (cents) => format.number(cents / 100, currencyFormat).length > 11
  )

  function pickQuickBid(cents: number) {
    storeBid.reset()
    form.setValue("amount", centsToMoney(cents), {
      shouldValidate: form.formState.isSubmitted,
    })
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    storeBid.reset()
    void form.handleSubmit((values) => {
      storeBid.mutate(
        {
          id: props.lot.id,
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
      className="flex flex-col gap-3.5"
      noValidate
      onSubmit={onSubmit}
    >
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 p-0 text-[13px] font-bold tracking-[1px] uppercase">
          {t("quickBid")}
        </legend>
        <div
          className={cn(
            "grid gap-2.5",
            stackQuickBids ? "grid-cols-1" : "grid-cols-3"
          )}
        >
          {quickBids.map((cents) => {
            const deltaCents = cents - baseCents

            return (
              <button
                key={cents}
                type="button"
                disabled={storeBid.isPending}
                onClick={() => pickQuickBid(cents)}
                className={cn(
                  press,
                  "@container flex min-w-0 items-center gap-0.5 rounded-none border-3 border-input bg-card text-foreground shadow-hard-3 disabled:pointer-events-none disabled:opacity-45",
                  stackQuickBids
                    ? "min-h-11 justify-between gap-3 px-3.5 py-2"
                    : "min-h-14 flex-col px-1.5 py-2"
                )}
              >
                <span className="font-heading text-[15px] text-red-text">
                  <FitAmount>
                    {deltaCents === 0
                      ? t("quickBidMinimum")
                      : `+ ${format.number(deltaCents / 100, incrementFormat)}`}
                  </FitAmount>
                </span>
                <span className="text-[13px] font-bold">
                  <FitAmount>
                    {format.number(cents / 100, currencyFormat)}
                  </FitAmount>
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bid-amount" className="text-[13px]">
          {t("yourBid")}
        </Label>
        <div className="flex">
          <span
            aria-hidden="true"
            className={cn(
              "flex items-center border-3 border-r-0 bg-brand-ink px-3.5 font-heading text-lg text-brand-yellow",
              invalid ? "border-brand-red" : "border-input"
            )}
          >
            R$
          </span>
          <Input
            id="bid-amount"
            type="text"
            inputMode="decimal"
            placeholder={centsToMoney(minimumCents)}
            autoComplete="off"
            aria-invalid={invalid ? true : undefined}
            aria-describedby={describedBy.length > 0 ? describedBy : undefined}
            disabled={storeBid.isPending}
            className="h-auto min-h-14 font-heading text-[22px]"
            {...form.register("amount", {
              onChange: () => {
                if (storeBid.isError) {
                  storeBid.reset()
                }
              },
            })}
          />
        </div>
        {amountError ? (
          <p
            id="bid-amount-error"
            className="m-0 text-sm font-bold text-red-text"
          >
            {translateError(amountError)}
          </p>
        ) : null}
      </div>
      {storeBid.isError ? (
        <p
          id="place-bid-error"
          role="alert"
          className="m-0 text-sm font-bold text-red-text"
        >
          {requestErrorCode
            ? t(bidErrorMessageKey[requestErrorCode])
            : t("bidError")}
        </p>
      ) : null}
      <Button
        id="place-bid"
        type="submit"
        size="lg"
        disabled={storeBid.isPending}
        className="w-full gap-3"
      >
        <GavelIcon />
        {storeBid.isPending ? t("placingBid") : t("placeBid")}
      </Button>
      <p className="m-0 text-center text-[13px] text-muted-foreground">
        {t("finalNote")}
      </p>
    </form>
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
