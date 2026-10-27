"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState } from "react"

//* Components imports
import { CardSearchPanel } from "@/src/components/auctioneer/card-search-panel"
import {
  CreateLotForm,
  CreateLotSubmit,
} from "@/src/components/auctioneer/create-lot-form"
import { CreateLotProvider } from "@/src/components/auctioneer/create-lot-provider"
import { LotCards } from "@/src/components/auctioneer/lot-cards"
import { LotDetailsFields } from "@/src/components/auctioneer/lot-details-fields"
import { AuctioneerSidebar } from "@/src/components/auctioneer/auctioneer-sidebar"
import { PrivateLotDetails } from "@/src/components/auctioneer/private-lot-details"
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import Drawer from "@/src/components/ui/drawer"
import Sidebar from "@/src/components/ui/sidebar"

//* Hooks imports
import { useShowPrivateLot } from "@/src/hooks/lots/queries/use-show-private-lot"

const searchIdPrefix = "mobile-search-"

function PrivateLotWorkspace(props: {
  query: ReturnType<typeof useShowPrivateLot>
}) {
  const t = useTranslations("pages./auctioneer")

  if (props.query.isError) {
    return (
      <Card.Root id="private-lot-error-card" className="min-h-160">
        <Card.Content>
          <p id="private-lot-error">{t("lotError")}</p>
        </Card.Content>
      </Card.Root>
    )
  }

  if (!props.query.data) {
    return (
      <Card.Root id="private-lot-loading-card" className="min-h-160">
        <Card.Content>
          <p id="private-lot-loading">{t("lotLoading")}</p>
        </Card.Content>
      </Card.Root>
    )
  }

  return <PrivateLotDetails lot={props.query.data.lot} />
}

export function AuctioneerPanel() {
  const t = useTranslations("pages./auctioneer")
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const privateLot = useShowPrivateLot({
    id: selectedLotId ?? "",
    enabled: selectedLotId !== null,
  })

  function onSelectLot(lotId: string) {
    setSelectedLotId(lotId)
  }

  function onCreateLot() {
    setSelectedLotId(null)
  }

  return (
    <CreateLotProvider>
      <Sidebar.Provider className="min-h-0 w-full">
        <div
          id="auctioneer-panel"
          className="flex w-full flex-col gap-4 md:flex-row md:items-stretch"
        >
          <AuctioneerSidebar
            selectedLotId={selectedLotId}
            onSelectLot={onSelectLot}
            onCreateLot={onCreateLot}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <header className="flex items-center justify-end rounded-xl bg-card p-2 ring-1 ring-foreground/10 md:hidden">
              <Sidebar.Trigger
                id="auctioneer-sidebar-toggle"
                type="button"
                aria-label={t("toggleSidebar")}
              />
            </header>
            {selectedLotId === null ? (
              <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-stretch">
                <Card.Root id="auctioneer-lot-column" className="min-h-160">
                  <CreateLotForm>
                    <Card.Content className="flex flex-1 flex-col">
                      <LotCards
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
                                  />
                                </div>
                              </Drawer.Content>
                            </Drawer.Root>
                          </div>
                        }
                      />
                    </Card.Content>
                    <Card.Footer className="flex-col items-stretch gap-4">
                      <LotDetailsFields />
                      <CreateLotSubmit />
                    </Card.Footer>
                  </CreateLotForm>
                </Card.Root>
                <div className="hidden h-full min-h-0 lg:block">
                  <CardSearchPanel />
                </div>
              </div>
            ) : (
              <PrivateLotWorkspace query={privateLot} />
            )}
          </div>
        </div>
      </Sidebar.Provider>
    </CreateLotProvider>
  )
}
