"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import Sidebar from "@/src/components/ui/sidebar"

//* Lib imports
import {
  auctioneerLots,
  selectedAuctioneerLot,
} from "@/src/lib/auctioneer/mock-auctioneer"
import { lotStatuses } from "@/src/lib/lots/mock-lots"

export function AuctioneerSidebar() {
  const t = useTranslations("pages./auctioneer")

  return (
    <Sidebar.Provider className="h-full min-h-0 w-full">
      <Sidebar.Root
        id="auctioneer-sidebar"
        collapsible="none"
        className="h-full w-full rounded-xl ring-1 ring-foreground/10"
      >
        <Sidebar.Header className="gap-4 p-4">
          <Button id="create-lot" type="button" className="w-full">
            {t("createLot")}
          </Button>
          <div className="flex flex-col gap-2">
            <Label htmlFor="auctioneer-lot-search">{t("lotSearchLabel")}</Label>
            <Sidebar.Input
              id="auctioneer-lot-search"
              type="search"
              placeholder={t("lotSearchPlaceholder")}
            />
          </div>
        </Sidebar.Header>
        <Sidebar.Separator />
        <Sidebar.Content className="gap-2">
          <Sidebar.Group className="px-4">
            <Sidebar.GroupContent
              id="auctioneer-lot-filters"
              role="group"
              aria-label={t("lotFiltersLabel")}
              className="flex flex-wrap gap-2"
            >
              {lotStatuses.map((status) => (
                <Button
                  key={status}
                  id={`auctioneer-lot-filter-${status}`}
                  type="button"
                  variant="outline"
                >
                  {t(`statuses.${status}`)}
                </Button>
              ))}
            </Sidebar.GroupContent>
          </Sidebar.Group>
          <Sidebar.Group className="gap-2 px-4">
            <Sidebar.GroupLabel
              className="h-auto px-0 text-sm font-medium text-sidebar-foreground"
              render={<h2 id="auctioneer-lots-label">{t("lotsLabel")}</h2>}
            />
            <Sidebar.GroupContent>
              <Sidebar.Menu
                id="auctioneer-lots"
                aria-labelledby="auctioneer-lots-label"
                className="gap-2"
              >
                {auctioneerLots.map((lot) => {
                  const selected = lot.id === selectedAuctioneerLot.id

                  return (
                    <Sidebar.MenuItem key={lot.id}>
                      <Sidebar.MenuButton
                        id={`auctioneer-lot-${lot.id}`}
                        type="button"
                        isActive={selected}
                        aria-current={selected ? "true" : undefined}
                        className="h-8"
                      >
                        <span>{lot.title}</span>
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  )
                })}
              </Sidebar.Menu>
            </Sidebar.GroupContent>
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar.Root>
    </Sidebar.Provider>
  )
}
