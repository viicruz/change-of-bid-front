"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { CardMeta, CardThumb } from "@/src/components/auctioneer/card-thumb"
import { Button } from "@/src/components/ui/button"

//* Hooks imports
import { useLotCardFields } from "@/src/components/auctioneer/create-lot-provider"

//* Local imports
import type { AuctioneerCard } from "@/src/lib/cards/auctioneer-card"

type CardSearchResultProps = {
  idPrefix?: string
  card: AuctioneerCard
}

export function CardSearchResult(props: CardSearchResultProps) {
  const t = useTranslations("pages./auctioneer")
  const idPrefix = props.idPrefix ?? ""
  const cards = useLotCardFields()
  const cardId = Number(props.card.id)
  const isSelected = cards.fields.some((field) => field.cardId === cardId)

  function onAdd() {
    if (isSelected || !Number.isInteger(cardId) || cardId <= 0) {
      return
    }

    cards.append({
      cardId,
      name: props.card.name,
      cardType: props.card.cardType,
      ...(props.card.attribute ? { attribute: props.card.attribute } : {}),
      ...(props.card.imageUrl ? { imageUrl: props.card.imageUrl } : {}),
    })
  }

  return (
    <div
      id={`${idPrefix}card-search-card-${props.card.id}`}
      data-selected={isSelected ? "" : undefined}
      className="flex items-center gap-3 px-3 py-2.5"
    >
      <CardThumb
        name={props.card.name}
        cardType={props.card.cardType}
        imageUrl={props.card.imageUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold">{props.card.name}</p>
        <CardMeta
          cardType={props.card.cardType}
          attribute={props.card.attribute}
        />
        {isSelected ? (
          <p className="text-xs font-bold text-yellow-text">{t("inLot")}</p>
        ) : null}
      </div>
      <Button
        id={`${idPrefix}add-card-${props.card.id}`}
        type="button"
        size="sm"
        //* Yellow, not red: white on red needs 18px+ to reach AA
        variant="secondary"
        aria-label={t("addCardNamed", { name: props.card.name })}
        disabled={isSelected}
        onClick={onAdd}
      >
        {t("add")}
      </Button>
    </div>
  )
}
