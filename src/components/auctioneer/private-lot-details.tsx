"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { auctioneerLotStatusLabelKey } from "@/src/components/auctioneer/auctioneer-lot-list"
import { AuctioneerCardTile } from "@/src/components/auctioneer/auctioneer-card-tile"
import { Badge } from "@/src/components/ui/badge"
import Card from "@/src/components/ui/card"

//* Hooks imports
import type { ShowPrivateLot } from "@/src/hooks/lots/queries/use-show-private-lot"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const scheduleFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

type PrivateLot = ShowPrivateLot["lot"]

function moneyToNumber(value: string) {
  return Number(value)
}

function itemsByPosition(items: PrivateLot["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

export function PrivateLotDetails(props: { lot: PrivateLot }) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const lot = props.lot
  const statusKey = auctioneerLotStatusLabelKey[lot.status]
  const items = itemsByPosition(lot.items)

  return (
    <Card.Root id="private-lot-details" className="min-h-160">
      <Card.Header>
        <Card.Title>
          <h2
            id="private-lot-title"
            className="font-heading text-xl font-medium wrap-break-word"
          >
            {lot.title}
          </h2>
        </Card.Title>
        <Card.Action>
          <Badge id="private-lot-status" variant="secondary">
            {t(`statuses.${statusKey}`)}
          </Badge>
        </Card.Action>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        {lot.description ? (
          <p id="private-lot-description">{lot.description}</p>
        ) : null}
        <div id="private-lot-summary" className="flex flex-col gap-1">
          <p>
            <span className="text-muted-foreground">{t("minimalValue")}</span>{" "}
            {format.number(moneyToNumber(lot.openingBid), currencyFormat)}
          </p>
          <p>
            <span className="text-muted-foreground">
              {t("minimumIncrement")}
            </span>{" "}
            {format.number(moneyToNumber(lot.minIncrement), currencyFormat)}
          </p>
          <p id="private-lot-current-bid">
            <span className="text-muted-foreground">{t("currentBid")}</span>{" "}
            {lot.currentBid === null
              ? t("noCurrentBid")
              : format.number(moneyToNumber(lot.currentBid), currencyFormat)}
          </p>
          <p>
            <span className="text-muted-foreground">{t("startsAt")}</span>{" "}
            {format.dateTime(lot.startsAt, scheduleFormat)}
          </p>
          <p>
            <span className="text-muted-foreground">{t("endsAt")}</span>{" "}
            {format.dateTime(lot.endsAt, scheduleFormat)}
          </p>
          {lot.extensionCount > 0 ? (
            <p id="private-lot-extensions">
              <span className="text-muted-foreground">{t("extensions")}</span>{" "}
              {lot.extensionCount}
            </p>
          ) : null}
        </div>
        {lot.sold ? (
          <div id="private-lot-settlement" className="flex flex-col gap-1">
            {lot.winnerParticipantNo !== null ? (
              <p>
                <span className="text-muted-foreground">{t("winner")}</span>{" "}
                {lot.winnerParticipantNo}
              </p>
            ) : null}
            {lot.receivedAmount !== null ? (
              <p>
                <span className="text-muted-foreground">
                  {t("receivedAmount")}
                </span>{" "}
                {format.number(
                  moneyToNumber(lot.receivedAmount),
                  currencyFormat
                )}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          <h3
            id="private-lot-cards-title"
            className="font-heading text-base font-medium"
          >
            {t("cardsInLot")}
          </h3>
          <ul
            id="private-lot-cards"
            aria-labelledby="private-lot-cards-title"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
          >
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2">
                <AuctioneerCardTile
                  idPrefix="private-lot"
                  card={{
                    id: String(item.cardId),
                    name: item.cardName,
                    imageUrl: item.imagePath,
                  }}
                />
                <p id={`private-lot-quantity-${item.id}`}>
                  <span className="text-muted-foreground">{t("quantity")}</span>{" "}
                  {item.quantity}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3
            id="private-lot-bids-title"
            className="font-heading text-base font-medium"
          >
            {t("bidHistory")}
          </h3>
          {lot.bids.length === 0 ? (
            <p id="private-lot-bids-empty">{t("emptyBids")}</p>
          ) : (
            <ul
              id="private-lot-bids"
              aria-labelledby="private-lot-bids-title"
              className="flex flex-col gap-3"
            >
              {lot.bids.map((bid) => (
                <li
                  key={bid.sequence}
                  id={`private-lot-bid-${bid.sequence}`}
                  className="flex flex-col gap-1"
                >
                  <p>
                    <span className="text-muted-foreground">
                      {t("participant")}
                    </span>{" "}
                    {bid.participantNo}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("bidAmount")}
                    </span>{" "}
                    {format.number(moneyToNumber(bid.amount), currencyFormat)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("bidTime")}
                    </span>{" "}
                    {format.dateTime(bid.createdAt, scheduleFormat)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card.Content>
    </Card.Root>
  )
}
