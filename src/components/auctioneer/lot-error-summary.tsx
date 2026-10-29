"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useFormState } from "react-hook-form"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Local imports
import {
  readCardsError,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"

//* Same order as the page: cards first, then the details top to bottom
const fieldLabelKey = {
  cards: "summaryCards",
  title: "lotName",
  description: "lotDescription",
  openingBid: "minimalValue",
  minIncrement: "minimumIncrement",
  startsAt: "startsAt",
  endsAt: "endsAt",
} as const

type LotFieldName = keyof typeof fieldLabelKey

const fieldNames = Object.keys(fieldLabelKey) as LotFieldName[]

//* Shown after a submit with errors, so nothing is missed in a hidden column
export function LotErrorSummary() {
  const t = useTranslations("pages./auctioneer")
  const translateError = useErrorTranslations()
  const { errors, isSubmitted } = useFormState<CreateLotFormValues>()
  const messages = fieldNames.flatMap((name) => {
    const code =
      name === "cards" ? readCardsError(errors.cards) : errors[name]?.message

    return code ? [{ name, message: translateError(code) }] : []
  })

  if (!isSubmitted || messages.length === 0) {
    return null
  }

  return (
    <div
      id="lot-error-summary"
      role="alert"
      className="flex flex-col gap-1.5 border-3 border-brand-red bg-muted px-3.5 py-3"
    >
      <strong className="text-sm">
        {t("errorSummary", { count: messages.length })}
      </strong>
      <ul className="flex list-disc flex-col gap-0.5 pl-4.5 text-[13px] font-bold text-red-text">
        {messages.map((entry) => (
          <li key={entry.name}>
            {t(fieldLabelKey[entry.name])}: {entry.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
