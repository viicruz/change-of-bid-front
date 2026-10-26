"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState } from "react"

//* Components imports
import { AssistanceMenu } from "@/src/components/auctioneer/assistance-menu"
import { AuctioneerSidebar } from "@/src/components/auctioneer/auctioneer-sidebar"
import { CardSearchPanel } from "@/src/components/auctioneer/card-search-panel"
import { LotCards } from "@/src/components/auctioneer/lot-cards"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import Drawer from "@/src/components/ui/drawer"
import Sidebar from "@/src/components/ui/sidebar"

//* Lib imports
import {
  selectedAuctioneerLot,
  type AuctioneerCard,
} from "@/src/lib/auctioneer/mock-auctioneer"

const searchIdPrefix = "mobile-search-"

export function AuctioneerPanel() {
  const t = useTranslations("pages./auctioneer")
  const [searchOpen, setSearchOpen] = useState(false)
  const [cards, setCards] = useState<AuctioneerCard[]>(
    selectedAuctioneerLot.cards
  )

  function addCard(card: AuctioneerCard) {
    setCards((current) => {
      const alreadyAdded = current.some((item) => item.id === card.id)

      if (alreadyAdded) {
        return current
      }

      return [...current, card]
    })
    setSearchOpen(false)
  }

  return (
    <Sidebar.Provider className="min-h-0 w-full">
      <div
        id="auctioneer-panel"
        className="flex w-full flex-col gap-4 md:flex-row md:items-stretch"
      >
        <AuctioneerSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex items-center justify-end rounded-xl bg-card p-2 ring-1 ring-foreground/10 md:hidden">
            <Sidebar.Trigger
              id="auctioneer-sidebar-toggle"
              type="button"
              aria-label={t("toggleSidebar")}
            />
          </header>
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-stretch">
            <Card.Root id="auctioneer-lot-column" className="min-h-160">
              <Card.Content className="flex flex-1 flex-col">
                <LotCards
                  cards={cards}
                  action={
                    <div className="lg:hidden">
                      <Drawer.Root
                        open={searchOpen}
                        onOpenChange={setSearchOpen}
                      >
                        <Drawer.Trigger
                          render={
                            <Button
                              id="auctioneer-add-card"
                              type="button"
                              variant="outline"
                              className="w-full border-dashed"
                            />
                          }
                        >
                          {t("addCard")}
                        </Drawer.Trigger>
                        <Drawer.Content>
                          <Drawer.Header>
                            <Drawer.Title
                              id={`${searchIdPrefix}card-search-title`}
                            >
                              {t("cardSearchTitle")}
                            </Drawer.Title>
                          </Drawer.Header>
                          <div className="min-h-0 flex-1 overflow-y-auto p-4">
                            <CardSearchPanel
                              idPrefix={searchIdPrefix}
                              framed={false}
                              onSelectCard={addCard}
                            />
                          </div>
                        </Drawer.Content>
                      </Drawer.Root>
                    </div>
                  }
                />
              </Card.Content>
              <Card.Footer className="flex-col items-stretch gap-4">
                <div className="hidden lg:block">
                  <AssistanceMenu lot={selectedAuctioneerLot} />
                </div>
                <div className="lg:hidden">
                  <Drawer.Root>
                    <Drawer.Trigger
                      render={
                        <Button
                          id="auctioneer-open-assistance-menu"
                          type="button"
                          className="w-full"
                        />
                      }
                    >
                      {t("assistanceMenu")}
                    </Drawer.Trigger>
                    <Drawer.Content>
                      <Drawer.Header>
                        <Drawer.Title id="mobile-assistance-menu-title">
                          {t("assistanceMenu")}
                        </Drawer.Title>
                      </Drawer.Header>
                      <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <AssistanceMenu
                          lot={selectedAuctioneerLot}
                          idPrefix="mobile-"
                          showTitle={false}
                        />
                      </div>
                    </Drawer.Content>
                  </Drawer.Root>
                </div>
              </Card.Footer>
            </Card.Root>
            <div className="hidden lg:block">
              <CardSearchPanel />
            </div>
          </div>
        </div>
      </div>
    </Sidebar.Provider>
  )
}
