"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useFormState } from "react-hook-form"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"

//* Lib imports
import { cn } from "@/src/lib/utils"

//* Which column shows below 1180px; above it every column is on screen
export type AuctioneerTab = "lots" | "cards" | "details"

type TabButtonProps = {
  id: string
  controls: string
  selected: boolean
  onSelect: () => void
  className?: string
  children: ReactNode
}

function TabButton(props: TabButtonProps) {
  return (
    <button
      id={props.id}
      type="button"
      role="tab"
      aria-selected={props.selected}
      aria-controls={props.controls}
      className={cn(
        //* Yellow, not red, for the selected tab: white on red needs 18px+ to reach AA
        "flex min-h-12 flex-1 items-center justify-center gap-1.5 border-l-3 border-black px-2 font-heading text-sm outline-none first:border-l-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring",
        props.selected
          ? "bg-brand-yellow text-brand-ink"
          : "bg-card text-card-foreground",
        props.className
      )}
      onClick={props.onSelect}
    >
      {props.children}
    </button>
  )
}

type AuctioneerTabsProps = {
  tab: AuctioneerTab
  viewing: boolean
  //* The draft's cards, or the published lot's while it is on screen
  cardCount: number
  onTabChange: (tab: AuctioneerTab) => void
}

//* Tablets get "lots / new lot"; phones split the new lot into cards and details
export function AuctioneerTabs(props: AuctioneerTabsProps) {
  const t = useTranslations("pages./auctioneer")
  const { errors, isSubmitted } = useFormState<CreateLotFormValues>()
  const detailsHaveErrors =
    isSubmitted && Object.keys(errors).some((name) => name !== "cards")
  const onMain = props.tab !== "lots"

  return (
    <div
      id="auctioneer-tabs"
      role="tablist"
      aria-label={t("sectionsLabel")}
      className="hidden border-3 border-black bg-card max-[1180px]:flex"
    >
      <TabButton
        id="auctioneer-tab-lots"
        controls="auctioneer-sidebar"
        selected={props.tab === "lots"}
        onSelect={() => props.onTabChange("lots")}
      >
        {t("tabLots")}
      </TabButton>
      {props.viewing ? (
        <TabButton
          id="auctioneer-tab-lot"
          controls="auctioneer-lot-view"
          selected={onMain}
          onSelect={() => props.onTabChange("cards")}
        >
          {t("tabLot")}
        </TabButton>
      ) : (
        <>
          <TabButton
            id="auctioneer-tab-new"
            controls="auctioneer-lot-column"
            selected={onMain}
            className="max-[760px]:hidden"
            onSelect={() => props.onTabChange("cards")}
          >
            {t("tabNewLot")}
          </TabButton>
          <TabButton
            id="auctioneer-tab-cards"
            controls="auctioneer-lot-column"
            selected={props.tab === "cards"}
            className="hidden max-[760px]:flex"
            onSelect={() => props.onTabChange("cards")}
          >
            {t("tabCards")}
            <span className="border-2 border-black bg-brand-ink px-1.5 text-[11px] text-brand-yellow">
              {props.cardCount}
            </span>
          </TabButton>
          <TabButton
            id="auctioneer-tab-details"
            controls="auctioneer-details-column"
            selected={props.tab === "details"}
            className="hidden max-[760px]:flex"
            onSelect={() => props.onTabChange("details")}
          >
            {t("tabDetails")}
            {detailsHaveErrors ? (
              <span
                id="auctioneer-tab-details-error"
                className="size-2.5 border-2 border-black bg-brand-red"
              >
                <span className="sr-only">{t("detailsHaveErrors")}</span>
              </span>
            ) : null}
          </TabButton>
        </>
      )}
    </div>
  )
}
