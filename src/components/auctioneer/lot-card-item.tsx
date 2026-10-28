"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { YugiohCard } from "@/src/components/cards/yugioh-card"
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

  function onRemove() {
    props.onRemove(props.index)
  }

  return (
    <div className="flex flex-col gap-2">
      <YugiohCard
        id={`lot--auctioneer-card-${props.cardId}`}
        name={props.name}
        imageUrl={props.imageUrl}
        size="sm"
      />
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
