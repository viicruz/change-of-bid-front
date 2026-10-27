"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { AuctioneerCardTile } from "@/src/components/auctioneer/auctioneer-card-tile"
import { Button } from "@/src/components/ui/button"

type LotCardItemProps = {
  index: number
  cardId: number
  name: string
  imageUrl?: string
  onRemove: (index: number) => void
}

export function LotCardItem(props: LotCardItemProps) {
  const t = useTranslations("pages./auctioneer")
  const card = {
    id: String(props.cardId),
    name: props.name,
    ...(props.imageUrl ? { imageUrl: props.imageUrl } : {}),
  }

  function onRemove() {
    props.onRemove(props.index)
  }

  return (
    <div className="flex flex-col gap-2">
      <AuctioneerCardTile card={card} idPrefix="lot-" />
      <Button
        id={`remove-lot-card-${props.cardId}`}
        type="button"
        variant="outline"
        className="w-full"
        onClick={onRemove}
      >
        {t("removeCard")}
      </Button>
    </div>
  )
}
