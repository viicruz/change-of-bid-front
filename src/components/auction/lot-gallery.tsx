"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useState } from "react"

//* Components imports
import { press } from "@/src/components/ui/button"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { cn } from "@/src/lib/utils"

const imageWidth = 421
const imageHeight = 614

type PublicLotItem = ShowLot["lot"]["items"][number]

export function LotGallery(props: { items: PublicLotItem[] }) {
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
