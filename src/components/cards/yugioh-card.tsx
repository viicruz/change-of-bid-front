"use client"

//* Libraries imports
import Image from "next/image"
import { useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

const imageWidth = 421
const imageHeight = 614

const imageSizes = {
  sm: "(min-width: 1024px) 8rem, 40vw",
  md: "(min-width: 1024px) 8rem, 30vw",
  lg: "(min-width: 1024px) 8rem, 30vw",
} as const

type YugiohCardSize = keyof typeof imageSizes

type YugiohCardProps = {
  name: string
  imageUrl?: string
  size: YugiohCardSize
  amount?: number
  quantityId?: string
  nameId?: string
  id?: string
}

function QuantityBadge(props: { id?: string; amount: number }) {
  const t = useTranslations("components.yugiohCard")

  return (
    <p
      id={props.id}
      className="absolute right-1 bottom-1 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white shadow-sm"
    >
      <span className="sr-only">{t("quantity")} </span>
      <span aria-hidden="true">×</span>
      {props.amount}
    </p>
  )
}

function CardImage(props: {
  imageUrl?: string
  size: YugiohCardSize
  className: string
}) {
  if (!props.imageUrl) {
    return null
  }

  return (
    <Image
      src={props.imageUrl}
      alt=""
      width={imageWidth}
      height={imageHeight}
      sizes={imageSizes[props.size]}
      className={props.className}
    />
  )
}

export function YugiohCard(props: YugiohCardProps) {
  if (props.size === "sm") {
    return (
      <Card.Root id={props.id}>
        <Card.Content className="flex flex-col gap-2">
          <div className="relative">
            {props.imageUrl ? (
              <CardImage
                imageUrl={props.imageUrl}
                size={props.size}
                className="aspect-3/4 h-auto w-full rounded-md object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="aspect-3/4 w-full rounded-md bg-muted"
              />
            )}
            {props.amount !== undefined ? (
              <QuantityBadge id={props.quantityId} amount={props.amount} />
            ) : null}
          </div>
          <p
            id={props.nameId}
            className="line-clamp-2 font-heading text-sm font-medium"
          >
            {props.name}
          </p>
        </Card.Content>
      </Card.Root>
    )
  }

  if (props.size === "lg") {
    return (
      <article
        id={props.id}
        className="group relative aspect-59/86 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/20 transition duration-200 hover:ring-foreground/60"
      >
        <CardImage
          imageUrl={props.imageUrl}
          size={props.size}
          className="size-full object-cover transition duration-200 group-hover:scale-105"
        />
        <p id={props.nameId} className="sr-only">
          {props.name}
        </p>
        {props.amount !== undefined ? (
          <QuantityBadge id={props.quantityId} amount={props.amount} />
        ) : null}
      </article>
    )
  }

  return (
    <article id={props.id} className="flex flex-col gap-2">
      <div className="relative aspect-59/86 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/20">
        <CardImage
          imageUrl={props.imageUrl}
          size={props.size}
          className="size-full object-cover"
        />
        {props.amount !== undefined ? (
          <QuantityBadge id={props.quantityId} amount={props.amount} />
        ) : null}
      </div>
      <p id={props.nameId} className="text-sm font-medium">
        {props.name}
      </p>
    </article>
  )
}
