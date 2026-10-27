//* Libraries imports
import Image from "next/image"

//* Components imports
import Card from "@/src/components/ui/card"

type AuctioneerCardTileCard = {
  id: string
  name: string
  imageUrl?: string
}

type AuctioneerCardTileProps = {
  card: AuctioneerCardTileCard
  idPrefix?: string
}

export function AuctioneerCardTile(props: AuctioneerCardTileProps) {
  const idPrefix = props.idPrefix ?? ""

  return (
    <Card.Root id={`${idPrefix}-auctioneer-card-${props.card.id}`}>
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
}
