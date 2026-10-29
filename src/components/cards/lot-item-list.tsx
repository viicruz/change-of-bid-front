"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import Image from "next/image"
import * as z from "zod"

//* Schema imports
import type { LotItem } from "@/src/schemas/lot"

const imageWidth = 421
const imageHeight = 614

const cardTypeSchema = z.object({ humanReadableCardType: z.string().min(1) })

type LotListItem = LotItem & { cardSnapshot: unknown }

type LotItemListProps = {
  //* Prefix for the list ids: `${idPrefix}s`, `${idPrefix}-${id}`, `${idPrefix}-quantity-${id}`
  idPrefix: string
  //* Items already in position order
  items: LotListItem[]
}

function cardType(item: LotListItem) {
  const parsed = cardTypeSchema.safeParse(item.cardSnapshot)

  return parsed.success ? parsed.data.humanReadableCardType : null
}

/** The lot's cards as rows: thumb, name, type and quantity, with the total below. */
export function LotItemList(props: LotItemListProps) {
  const t = useTranslations("components.lotItemList")
  const totalCards = props.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="border-4 border-border bg-card">
      <ul id={`${props.idPrefix}s`} className="m-0 grid list-none p-0">
        {props.items.map((item) => {
          const type = cardType(item)

          return (
            <li
              key={item.id}
              id={`${props.idPrefix}-${item.id}`}
              className="flex items-center gap-4 border-b-3 border-line-soft px-4 py-3"
            >
              <Image
                src={item.imagePath}
                alt=""
                width={imageWidth}
                height={imageHeight}
                sizes="48px"
                className="block h-auto w-12 border-2 border-black"
              />
              <div className="min-w-0 flex-1">
                <div className="font-heading text-base leading-[1.15] wrap-break-word">
                  {item.cardName}
                </div>
                {type ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    {type}
                  </div>
                ) : null}
              </div>
              <span
                id={`${props.idPrefix}-quantity-${item.id}`}
                className="min-w-14 border-2 border-black bg-brand-ink px-3 py-1.5 text-center font-heading text-xl text-brand-yellow"
              >
                <span className="sr-only">{t("quantity")}: </span>×
                {item.quantity}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="flex items-center justify-between bg-brand-yellow px-4 py-3.5 font-heading text-base text-brand-ink">
        <span>{t("total")}</span>
        <span>{t("cardCount", { count: totalCards })}</span>
      </div>
    </div>
  )
}
