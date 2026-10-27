"use client"

//* Libraries imports
import Image from "next/image"
import { useTranslations } from "next-intl"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

type LotItem = ShowLot["lot"]["items"][number]

export function LotItemCard(props: { item: LotItem }) {
  const t = useTranslations("pages./auction/[id]/audit")
  const item = props.item

  return (
    <li className="min-w-0">
      <article id={`lot-item-${item.id}`} className="flex flex-col gap-2">
        <div className="relative aspect-59/86 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/20">
          <Image
            src={item.imagePath}
            alt=""
            width={421}
            height={614}
            sizes="(min-width: 1024px) 8rem, 30vw"
            className="size-full object-cover"
          />
          <p
            id={`lot-item-quantity-${item.id}`}
            className="absolute right-1 bottom-1 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white shadow-sm"
          >
            <span className="sr-only">{t("quantity")} </span>
            <span aria-hidden="true">×</span>
            {item.quantity}
          </p>
        </div>
        <p id={`lot-item-name-${item.id}`} className="text-sm font-medium">
          {item.cardName}
        </p>
      </article>
    </li>
  )
}
