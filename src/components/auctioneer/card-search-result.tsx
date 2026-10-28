"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { YugiohCard } from "@/src/components/cards/yugioh-card"
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
      ...(props.card.imageUrl ? { imageUrl: props.card.imageUrl } : {}),
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        id={`${idPrefix}card-search-card-${props.card.id}`}
        className={isSelected ? "blur-[2px]" : undefined}
      >
        <YugiohCard
          id={`${idPrefix}-auctioneer-card-${props.card.id}`}
          name={props.card.name}
          imageUrl={props.card.imageUrl}
          size="sm"
        />
      </div>
      <Button
        id={`${idPrefix}add-card-${props.card.id}`}
        type="button"
        variant="outline"
        className="w-full"
        disabled={isSelected}
        onClick={onAdd}
      >
        {t("addCard")}
      </Button>
    </div>
  )
}
