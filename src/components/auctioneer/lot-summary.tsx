"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"

//* Hooks imports
import { useLotCardFields } from "@/src/components/auctioneer/create-lot-provider"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"
import { lotDuration, type LotDuration } from "@/src/lib/lots/lot-schedule"
import { cn } from "@/src/lib/utils"

const emptyValue = "—"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

function SummaryCell(props: {
  id: string
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "min-w-fit grow basis-[40%] bg-card px-3 py-2.5",
        props.highlight && "bg-brand-ink text-brand-yellow"
      )}
    >
      <dt
        className={cn(
          "text-[11px] font-bold tracking-[1px] uppercase",
          props.highlight ? "text-white" : "text-muted-foreground"
        )}
      >
        {props.label}
      </dt>
      <dd id={props.id} className="font-heading text-[17px]">
        {props.value}
      </dd>
    </div>
  )
}

type LotSummaryGridProps = {
  idPrefix: string
  cardCount: number
  duration: LotDuration | null
  //* Decimal strings, as the form and the API keep them
  openingBid: string
  minIncrement: string
}

export function LotSummaryGrid(props: LotSummaryGridProps) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()

  function money(value: string) {
    const amount = Number(value)

    if (!value || !(amount > 0)) {
      return emptyValue
    }

    return format.number(amount, currencyFormat)
  }

  function durationLabel() {
    if (!props.duration) {
      return emptyValue
    }

    const days = String(props.duration.days)
    const hours = String(props.duration.hours)
    const minutes = String(props.duration.minutes)

    if (props.duration.days > 0) {
      return t("durationValueDays", { days, hours })
    }

    return t("durationValueHours", { hours, minutes })
  }

  //* Two cells a row; a cell takes the whole row when its amount doesn't fit in half
  return (
    <dl
      id={props.idPrefix}
      aria-label={t("summaryLabel")}
      className="flex flex-wrap gap-0.75 border-3 border-input bg-input"
    >
      <SummaryCell
        id={`${props.idPrefix}-cards`}
        label={t("summaryCards")}
        value={String(props.cardCount)}
      />
      <SummaryCell
        id={`${props.idPrefix}-duration`}
        label={t("summaryDuration")}
        value={durationLabel()}
      />
      <SummaryCell
        id={`${props.idPrefix}-opening-bid`}
        label={t("minimalValue")}
        value={money(props.openingBid)}
        highlight
      />
      <SummaryCell
        id={`${props.idPrefix}-increment`}
        label={t("summaryIncrement")}
        value={money(props.minIncrement)}
      />
    </dl>
  )
}

//* What the auctioneer is about to publish, read from the form as they type
export function LotSummary() {
  const form = useFormContext<CreateLotFormValues>()
  const cards = useLotCardFields()
  const [openingBid, minIncrement, startsAt, endsAt] = useWatch({
    control: form.control,
    name: ["openingBid", "minIncrement", "startsAt", "endsAt"],
  })

  return (
    <LotSummaryGrid
      idPrefix="lot-summary"
      cardCount={cards.fields.length}
      duration={lotDuration(startsAt, endsAt)}
      openingBid={openingBid}
      minIncrement={minIncrement}
    />
  )
}
