//* Components imports
import { AssistanceMenu } from "@/src/components/auctioneer/assistance-menu"
import { AuctioneerSidebar } from "@/src/components/auctioneer/auctioneer-sidebar"
import { CardSearchPanel } from "@/src/components/auctioneer/card-search-panel"
import { LotCards } from "@/src/components/auctioneer/lot-cards"
import Card from "@/src/components/ui/card"

//* Lib imports
import { selectedAuctioneerLot } from "@/src/lib/auctioneer/mock-auctioneer"

export function AuctioneerPanel() {
  return (
    <div
      id="auctioneer-panel"
      className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)_18rem] lg:items-stretch"
    >
      <AuctioneerSidebar />
      <Card.Root id="auctioneer-lot-column" className="min-h-160">
        <Card.Content className="flex flex-1 flex-col">
          <LotCards cards={selectedAuctioneerLot.cards} />
        </Card.Content>
        <Card.Footer className="flex-col items-stretch gap-4">
          <AssistanceMenu lot={selectedAuctioneerLot} />
        </Card.Footer>
      </Card.Root>
      <CardSearchPanel />
    </div>
  )
}
