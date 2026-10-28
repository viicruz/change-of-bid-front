"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"

//* Hooks imports
import { useCreateLotMutation } from "@/src/components/auctioneer/create-lot-provider"

//* Schema imports
import type { Lot } from "@/src/schemas/lot"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

type AuctioneerMobileBarProps = {
  createdLot: Lot | null
  cardCount: number
  onCreateAnother: () => void
}

//* Phones only: the publish button stays at hand whichever tab is open
export function AuctioneerMobileBar(props: AuctioneerMobileBarProps) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const form = useFormContext<CreateLotFormValues>()
  const storeLot = useCreateLotMutation()
  const draftOpeningBid = useWatch({
    control: form.control,
    name: "openingBid",
  })
  const openingBid = props.createdLot?.openingBid ?? draftOpeningBid
  const openingAmount = Number(openingBid)

  return (
    <div
      id="auctioneer-mobile-bar"
      className="sticky bottom-0 z-20 -mx-[clamp(16px,3vw,40px)] hidden items-center justify-between gap-3 border-t-4 border-brand-red bg-header px-4 py-2.5 max-[760px]:flex"
    >
      <div className="min-w-0">
        <span className="block text-xs font-bold text-muted-foreground uppercase">
          {t("minimalValue")}
        </span>
        <span
          id="auctioneer-mobile-bar-value"
          className="block font-heading text-base whitespace-nowrap"
        >
          {openingBid && openingAmount > 0
            ? format.number(openingAmount, currencyFormat)
            : "—"}
        </span>
        <span
          id="auctioneer-mobile-bar-cards"
          className="block text-xs font-semibold"
        >
          {t("cardsCount", { count: props.cardCount })}
        </span>
      </div>
      {props.createdLot ? (
        <Button
          id="mobile-create-another-lot"
          type="button"
          className="shrink-0 px-4"
          onClick={props.onCreateAnother}
        >
          {t("createAnother")}
        </Button>
      ) : (
        <Button
          id="mobile-create-lot-submit"
          type="submit"
          form="create-lot-form"
          className="shrink-0 px-4"
          disabled={storeLot.isPending}
        >
          {storeLot.isPending ? t("submitting") : t("submit")}
        </Button>
      )}
    </div>
  )
}
