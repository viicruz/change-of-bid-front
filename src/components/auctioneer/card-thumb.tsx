"use client"

//* Libraries imports
import Image from "next/image"
import { useTranslations } from "next-intl"

//* Schema imports
import type { CardAttribute } from "@/src/schemas/card"

//* Lib imports
import type { CardType } from "@/src/lib/lots/mock-lots"
import { cn } from "@/src/lib/utils"

const imageWidth = 421
const imageHeight = 614

//* Card frame colors, for cards that come without an image
const frameClassName = {
  monster: "bg-[#b5561e]",
  spell: "bg-[#127a6c]",
  trap: "bg-[#9a2766]",
  extra: "bg-[#5b3a8c]",
} as const satisfies Record<CardType, string>

const thumbSize = {
  xs: { className: "w-10 border-2", sizes: "40px", text: "text-xs" },
  sm: { className: "w-11 border-2", sizes: "44px", text: "text-[13px]" },
  md: { className: "w-14 border-3", sizes: "56px", text: "text-[15px]" },
  lg: { className: "w-16 border-3", sizes: "64px", text: "text-base" },
} as const

type CardThumbProps = {
  name: string
  //* Picks the frame color when there is no image; neutral without it
  cardType?: CardType
  imageUrl?: string
  size: keyof typeof thumbSize
  className?: string
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => /^[a-z]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("")
}

export function CardThumb(props: CardThumbProps) {
  const size = thumbSize[props.size]

  if (props.imageUrl) {
    return (
      <Image
        src={props.imageUrl}
        alt=""
        width={imageWidth}
        height={imageHeight}
        sizes={size.sizes}
        className={cn(
          "block h-auto shrink-0 border-black",
          size.className,
          props.className
        )}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex aspect-421/614 shrink-0 items-center justify-center border-black font-heading text-white",
        size.className,
        size.text,
        props.cardType ? frameClassName[props.cardType] : "bg-stage",
        props.className
      )}
    >
      {initialsOf(props.name)}
    </span>
  )
}

type CardMetaProps = {
  cardType: CardType
  attribute?: CardAttribute
  className?: string
}

//* "Monstro · Luz"
export function CardMeta(props: CardMetaProps) {
  const t = useTranslations("pages./auctioneer")
  const parts = [t(`cardTypes.${props.cardType}`)]

  if (props.attribute) {
    parts.push(t(`cardAttributes.${props.attribute}`))
  }

  return (
    <p className={cn("text-[13px] text-muted-foreground", props.className)}>
      {parts.join(" · ")}
    </p>
  )
}
