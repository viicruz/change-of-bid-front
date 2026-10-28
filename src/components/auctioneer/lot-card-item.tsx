"use client"

//* Libraries imports
import { Trash2Icon } from "lucide-react"
import { useTranslations } from "next-intl"

//* Components imports
import { CardMeta, CardThumb } from "@/src/components/auctioneer/card-thumb"
import { Button } from "@/src/components/ui/button"

//* Local imports
import type { LotCardField } from "@/src/components/auctioneer/create-lot-form-schema"

type LotCardItemProps = {
  index: number
  card: LotCardField
  onRemove: (index: number) => void
}

export function LotCardItem(props: LotCardItemProps) {
  const t = useTranslations("pages./auctioneer")
  const removeLabel = t("removeCardNamed", { name: props.card.name })

  function onRemove() {
    props.onRemove(props.index)
  }

  return (
    <div
      id={`lot-card-${props.card.cardId}`}
      className="slide-in-from-top-1.5 flex animate-in items-center gap-4 border-4 border-border bg-card p-3 shadow-hard-6 duration-200 fade-in motion-reduce:animate-none"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CardThumb
          name={props.card.name}
          cardType={props.card.cardType}
          imageUrl={props.card.imageUrl}
          size="md"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-heading text-base leading-tight wrap-break-word">
            {props.card.name}
          </p>
          <CardMeta
            cardType={props.card.cardType}
            attribute={props.card.attribute}
          />
        </div>
      </div>
      <Button
        id={`remove-lot-card-${props.card.cardId}`}
        type="button"
        variant="destructive"
        size="icon"
        aria-label={removeLabel}
        title={removeLabel}
        onClick={onRemove}
      >
        <Trash2Icon aria-hidden="true" />
      </Button>
    </div>
  )
}
