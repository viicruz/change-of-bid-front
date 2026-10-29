"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import { GavelIcon } from "@/src/components/auction/auction-icons"
import { Button, press } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { FitAmount } from "@/src/components/utils/money"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import { usePlaceBid } from "@/src/hooks/lots/use-place-bid"

//* Local imports
import { centsToMoney } from "@/src/lib/auction/bid-money"
import { cn } from "@/src/lib/utils"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const incrementFormat = {
  maximumFractionDigits: 2,
} as const

type PlaceBid = ReturnType<typeof usePlaceBid>

function QuickBidPicker(props: { placeBid: PlaceBid }) {
  const t = useTranslations("pages./auction/[id]")
  const format = useFormatter()
  const { quickBids, baseCents, pending, pickQuickBid } = props.placeBid
  //* From R$ 10.000,00 up three amounts no longer fit side by side, so each takes a row
  const stackQuickBids = quickBids.some(
    (cents) => format.number(cents / 100, currencyFormat).length > 11
  )

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-[13px] font-bold tracking-[1px] uppercase">
        {t("quickBid")}
      </legend>
      <div
        className={cn(
          "grid gap-2.5",
          stackQuickBids ? "grid-cols-1" : "grid-cols-3"
        )}
      >
        {quickBids.map((cents) => {
          const deltaCents = cents - baseCents

          return (
            <button
              key={cents}
              type="button"
              disabled={pending}
              onClick={() => pickQuickBid(cents)}
              className={cn(
                press,
                "@container flex min-w-0 items-center gap-0.5 rounded-none border-3 border-input bg-card text-foreground shadow-hard-3 disabled:pointer-events-none disabled:opacity-45",
                stackQuickBids
                  ? "min-h-11 justify-between gap-3 px-3.5 py-2"
                  : "min-h-14 flex-col px-1.5 py-2"
              )}
            >
              <span className="font-heading text-[15px] text-red-text">
                <FitAmount>
                  {deltaCents === 0
                    ? t("quickBidMinimum")
                    : `+ ${format.number(deltaCents / 100, incrementFormat)}`}
                </FitAmount>
              </span>
              <span className="text-[13px] font-bold">
                <FitAmount>
                  {format.number(cents / 100, currencyFormat)}
                </FitAmount>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function BidAmountField(props: { placeBid: PlaceBid }) {
  const t = useTranslations("pages./auction/[id]")
  const translateError = useErrorTranslations()
  const { amountField, amountError, invalid, describedBy, pending } =
    props.placeBid

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bid-amount" className="text-[13px]">
        {t("yourBid")}
      </Label>
      <div className="flex">
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center border-3 border-r-0 bg-brand-ink px-3.5 font-heading text-lg text-brand-yellow",
            invalid ? "border-brand-red" : "border-input"
          )}
        >
          R$
        </span>
        <Input
          id="bid-amount"
          type="text"
          inputMode="decimal"
          placeholder={centsToMoney(props.placeBid.minimumCents)}
          autoComplete="off"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          disabled={pending}
          className="h-auto min-h-14 font-heading text-[22px]"
          {...amountField}
        />
      </div>
      {amountError ? (
        <p
          id="bid-amount-error"
          className="m-0 text-sm font-bold text-red-text"
        >
          {translateError(amountError)}
        </p>
      ) : null}
    </div>
  )
}

export function PlaceBidForm(props: { lot: ShowLot["lot"] }) {
  const t = useTranslations("pages./auction/[id]")
  const placeBid = usePlaceBid(props.lot)

  return (
    <form
      id="place-bid-form"
      className="flex flex-col gap-3.5"
      noValidate
      onSubmit={placeBid.onSubmit}
    >
      <QuickBidPicker placeBid={placeBid} />
      <BidAmountField placeBid={placeBid} />
      {placeBid.requestErrorKey ? (
        <p
          id="place-bid-error"
          role="alert"
          className="m-0 text-sm font-bold text-red-text"
        >
          {t(placeBid.requestErrorKey)}
        </p>
      ) : null}
      <Button
        id="place-bid"
        type="submit"
        size="lg"
        disabled={placeBid.pending}
        className="w-full gap-3"
      >
        <GavelIcon />
        {placeBid.pending ? t("placingBid") : t("placeBid")}
      </Button>
      <p className="m-0 text-center text-[13px] text-muted-foreground">
        {t("finalNote")}
      </p>
    </form>
  )
}
