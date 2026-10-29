"use client"

//* Libraries imports
import { PlusIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"

//* Hooks imports
import { useLotCardFields } from "@/src/components/auctioneer/create-lot-provider"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

type LotDraftItemProps = {
  editing: boolean
  onOpenDraft: () => void
}

//* The lot being built, always on top of "my lots"; opening it keeps what was typed
export function LotDraftItem(props: LotDraftItemProps) {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const form = useFormContext<CreateLotFormValues>()
  const cards = useLotCardFields()
  const [title, openingBid] = useWatch({
    control: form.control,
    name: ["title", "openingBid"],
  })
  const openingAmount = Number(openingBid)
  const meta = [t("cardsCount", { count: cards.fields.length })]

  if (openingBid && openingAmount > 0) {
    meta.push(format.number(openingAmount, currencyFormat))
  }

  return (
    <button
      id="create-lot"
      type="button"
      aria-current={props.editing ? "true" : undefined}
      className="flex w-full items-center gap-3 border-b-3 border-black bg-brand-yellow px-3.5 py-3 text-left text-brand-ink outline-none focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand-ink"
      onClick={props.onOpenDraft}
    >
      <span
        aria-hidden="true"
        className="flex h-14 w-10 shrink-0 items-center justify-center border-3 border-dashed border-brand-ink"
      >
        <PlusIcon className="size-4.5" strokeWidth={3} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-heading text-[11px]">{t("draftLabel")}</span>
        <span id="create-lot-title" className="truncate text-[15px] font-bold">
          {title.trim() || t("draftUntitled")}
        </span>
        <span id="create-lot-meta" className="text-[13px] font-semibold">
          {meta.join(" · ")}
        </span>
      </span>
    </button>
  )
}
