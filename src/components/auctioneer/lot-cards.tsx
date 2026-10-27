"use client"

//* Libraries imports
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { useFormContext, type FieldErrors } from "react-hook-form"

//* Components imports
import { LotCardItem } from "@/src/components/auctioneer/lot-card-item"

//* Hooks imports
import { useLotCardFields } from "@/src/components/auctioneer/create-lot-provider"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"

type LotCardsProps = {
  idPrefix?: string
  action?: ReactNode
}

export function LotCards(props: LotCardsProps) {
  const t = useTranslations("pages./auctioneer")
  const translateError = useErrorTranslations()
  const idPrefix = props.idPrefix ?? ""
  const titleId = `${idPrefix}cards-in-lot-title`
  const form = useFormContext<CreateLotFormValues>()
  const cards = useLotCardFields()
  const cardsError = readCardsError(form.formState.errors.cards)

  return (
    <div className="flex flex-col gap-4">
      <h2
        id={titleId}
        className="text-center font-heading text-base font-medium"
      >
        {t("cardsInLot")}
      </h2>
      {props.action}
      <ul
        id={`${idPrefix}cards-in-lot`}
        aria-labelledby={titleId}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
      >
        {cards.fields.map((field, index) => (
          <li key={field.id}>
            <LotCardItem
              index={index}
              cardId={field.cardId}
              name={field.name}
              imageUrl={field.imageUrl}
              onRemove={cards.remove}
            />
          </li>
        ))}
      </ul>
      {cardsError ? (
        <p
          id={`${idPrefix}cards-in-lot-error`}
          className="text-sm text-destructive"
        >
          {translateError(cardsError)}
        </p>
      ) : null}
    </div>
  )
}

function readCardsError(error: FieldErrors<CreateLotFormValues>["cards"]) {
  if (!error) {
    return undefined
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message
  }

  if ("root" in error && error.root && typeof error.root.message === "string") {
    return error.root.message
  }

  return undefined
}
