//* Libraries imports
import Image from "next/image"

//* Components imports
import Card from "@/src/components/ui/card"

//* Lib imports
import type { AuctioneerCard } from "@/src/lib/auctioneer/mock-auctioneer"

type AuctioneerCardTileProps = {
  card: AuctioneerCard
  idPrefix?: string
  onSelect?: (card: AuctioneerCard) => void
}

export function AuctioneerCardTile(props: AuctioneerCardTileProps) {
  const idPrefix = props.idPrefix ?? ""
  const cardId = `${idPrefix}auctioneer-card-${props.card.id}`
  const onSelect = props.onSelect

  const body = (
    <Card.Root id={onSelect ? undefined : cardId}>
      <Card.Content className="flex flex-col gap-2">
        {props.card.imageUrl ? (
          <Image
            src={props.card.imageUrl}
            alt=""
            width={421}
            height={614}
            sizes="(min-width: 1024px) 8rem, 40vw"
            className="aspect-3/4 h-auto w-full rounded-md object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="aspect-3/4 w-full rounded-md bg-muted"
          />
        )}
        <p className="line-clamp-2 font-heading text-sm font-medium">
          {props.card.name}
        </p>
      </Card.Content>
    </Card.Root>
  )

  if (!onSelect) {
    return body
  }

  return (
    <button
      id={cardId}
      type="button"
      className="w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 text-left"
      onClick={() => {
        onSelect(props.card)
      }}
    >
      {body}
    </button>
  )
}
