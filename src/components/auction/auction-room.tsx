"use client"

//* Libraries imports
import Image from "next/image"
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Hooks imports
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { ApiError } from "@/src/lib/api"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const scheduleFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

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
  const t = useTranslations("pages./auction/[id]")
  const item = props.item

  return (
    <li className="min-w-0">
      <article
        id={`lot-item-${item.id}`}
        className="group relative aspect-59/86 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/20 transition duration-200 hover:ring-foreground/60"
      >
        <Image
          src={item.imagePath}
          alt=""
          width={421}
          height={614}
          sizes="(min-width: 1024px) 8rem, 30vw"
          className="size-full object-cover transition duration-200 group-hover:scale-105"
        />
        <p className="sr-only">{item.cardName}</p>
        <p
          id={`lot-item-quantity-${item.id}`}
          className="absolute right-1 bottom-1 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white shadow-sm"
        >
          <span className="sr-only">{t("quantity")} </span>
          <span aria-hidden="true">×</span>
          {item.quantity}
        </p>
      </article>
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

function PlaceBidForm() {
  const t = useTranslations("pages./auction/[id]")

  return (
    <div id="place-bid-form" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="bid-amount">{t("bidValue")}</Label>
        <Input
          id="bid-amount"
          type="text"
          inputMode="decimal"
          placeholder={t("bidValue")}
          className="border-foreground/30 bg-background dark:border-foreground/30 dark:bg-background"
        />
      </div>
      <Button id="place-bid" type="button">
        {t("placeBid")}
      </Button>
    </div>
  )
}

function BidPanel(props: {
  lot: PublicLot
  viewerParticipantNo: number | null
}) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const lot = props.lot

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
        {lot.leaderParticipantNo !== null ? (
          <ParticipantLine
            id="lot-leader"
            label={t("leader")}
            participantNo={lot.leaderParticipantNo}
            viewerParticipantNo={props.viewerParticipantNo}
          />
        ) : null}
        {props.viewerParticipantNo !== null ? (
          <p id="viewer-participant">
            <span className="text-muted-foreground">{t("yourNumber")}</span>{" "}
            {props.viewerParticipantNo}
          </p>
        ) : null}
        {lot.sold && lot.winnerParticipantNo !== null ? (
          <ParticipantLine
            id="lot-winner"
            label={t("winner")}
            participantNo={lot.winnerParticipantNo}
            viewerParticipantNo={props.viewerParticipantNo}
          />
        ) : null}
        {lot.status === "LIVE" ? <PlaceBidForm /> : null}
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

function AuctionRoomDetails(props: {
  lot: PublicLot
  viewerParticipantNo: number | null
}) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const lot = props.lot

  return (
    <section
      id="auction-room"
      className="flex w-full flex-col gap-4 rounded-xl p-6 ring-1 ring-foreground/10"
      aria-labelledby="auction-room-name"
    >
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
            </div>
            <LotItems items={lot.items} />
          </Card.Content>
        </Card.Root>
        <div className="flex h-full flex-col gap-4">
          <BidPanel lot={lot} viewerParticipantNo={props.viewerParticipantNo} />
          <BidHistory
            bids={lot.bids}
            viewerParticipantNo={props.viewerParticipantNo}
          />
        </div>
      </div>
    </section>
  )
}

export function AuctionRoom(props: { id: string }) {
  const t = useTranslations("pages./auction/[id]")
  const lotQuery = useShowLot({ id: props.id })

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

  return (
    <AuctionRoomDetails
      lot={lotQuery.data.lot}
      viewerParticipantNo={lotQuery.data.viewerParticipantNo}
    />
  )
}
