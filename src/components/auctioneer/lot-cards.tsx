"use client"

//* Libraries imports
import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

//* Components imports
import { LotCardItem } from "@/src/components/auctioneer/lot-card-item"

//* Hooks imports
import { useLotCardFields } from "@/src/components/auctioneer/create-lot-provider"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Local imports
import {
  readCardsError,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"

type LotCardsProps = {
  idPrefix?: string
  //* Sits to the right of the title
  action?: ReactNode
  //* Sits between the title and the cards, such as the card search
  children?: ReactNode
  searchOpen: boolean
  //* Shown in the empty lot, such as a button that opens the search
  emptyAction?: ReactNode
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
    <div className="flex flex-col gap-4.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            id={titleId}
            className="font-heading text-[26px] leading-tight font-normal"
          >
            {t("cardsInLot")}
          </h2>
          <p
            id={`${idPrefix}cards-in-lot-count`}
            aria-live="polite"
            className="text-sm font-bold text-muted-foreground"
          >
            {t("cardsCount", { count: cards.fields.length })}
          </p>
        </div>
        {props.action}
      </div>
      {props.children}
      {cardsError ? (
        <p
          id={`${idPrefix}cards-in-lot-error`}
          className="font-bold text-red-text"
        >
          {translateError(cardsError)}
        </p>
      ) : null}
      {cards.fields.length > 0 ? (
        <ul
          id={`${idPrefix}cards-in-lot`}
          aria-labelledby={titleId}
          className="flex flex-col gap-3.5"
        >
          {cards.fields.map((field, index) => (
            <li key={field.id}>
              <LotCardItem index={index} card={field} onRemove={cards.remove} />
            </li>
          ))}
        </ul>
      ) : (
        <LotCardsEmpty
          id={`${idPrefix}cards-in-lot-empty`}
          searchOpen={props.searchOpen}
          action={props.emptyAction}
        />
      )}
    </div>
  )
}

function LotCardsEmpty(props: {
  id: string
  searchOpen: boolean
  action?: ReactNode
}) {
  const t = useTranslations("pages./auctioneer")

  return (
    <div
      id={props.id}
      className="flex flex-col items-center gap-3.5 border-4 border-dashed border-input px-5 py-10 text-center"
    >
      <div aria-hidden="true" className="relative h-22.5 w-30">
        <span className="absolute top-1.5 left-2.5 h-19 w-13 -rotate-12 border-3 border-black bg-brand-yellow" />
        <span className="absolute top-1 left-14.5 h-19 w-13 rotate-10 border-3 border-black bg-brand-red" />
      </div>
      <p className="font-heading text-xl">{t("emptyLotTitle")}</p>
      <p className="max-w-95 text-muted-foreground">
        {props.searchOpen ? t("emptyLotSearchText") : t("emptyLotText")}
      </p>
      {props.action}
    </div>
  )
}
