"use client"

//* Components imports
import { CreateLotButton } from "@/src/components/auctioneer/create-lot-button"
import Sidebar from "@/src/components/ui/sidebar"

//* Hooks imports
import { useIsMobile } from "@/src/hooks/use-mobile"

export function AuctioneerSidebar() {
  const isMobile = useIsMobile()

  return (
    <Sidebar.Root
      id="auctioneer-sidebar"
      collapsible={isMobile ? "offcanvas" : "none"}
      className={
        isMobile
          ? undefined
          : "h-full shrink-0 rounded-xl ring-1 ring-foreground/10 max-md:hidden"
      }
    >
      <Sidebar.Header className="gap-4 p-4">
        <CreateLotButton />
      </Sidebar.Header>
    </Sidebar.Root>
  )
}
