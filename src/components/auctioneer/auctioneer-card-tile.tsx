//* Components imports
import Card from "@/src/components/ui/card"

//* Lib imports
import type { AuctioneerCard } from "@/src/lib/auctioneer/mock-auctioneer"

type AuctioneerCardTileProps = {
  card: AuctioneerCard
}

export function AuctioneerCardTile(props: AuctioneerCardTileProps) {
  return (
    <Card.Root id={`auctioneer-card-${props.card.id}`}>
      <Card.Content className="flex flex-col gap-2">
        <div
          aria-hidden="true"
          className="aspect-3/4 w-full rounded-md bg-muted"
        />
        <p className="line-clamp-2 font-heading text-sm font-medium">
          {props.card.name}
        </p>
      </Card.Content>
    </Card.Root>
  )
}
