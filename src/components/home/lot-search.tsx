"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import type { ChangeEvent } from "react"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import { cardTypes, type CardType } from "@/src/lib/lots/mock-lots"

type LotSearchProps = {
  query: string
  selectedTypes: CardType[]
  onQueryChange: (query: string) => void
  onTypeToggle: (cardType: CardType) => void
}

export function LotSearch(props: LotSearchProps) {
  const t = useTranslations("pages./")

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    props.onQueryChange(event.target.value)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="lot-search">{t("searchLabel")}</Label>
        <Input
          id="lot-search"
          type="search"
          value={props.query}
          placeholder={t("searchPlaceholder")}
          onChange={onChange}
        />
      </div>
      <div
        id="lot-filters"
        role="group"
        aria-label={t("filtersLabel")}
        className="flex flex-wrap justify-center gap-2"
      >
        {cardTypes.map((cardType) => {
          const selected = props.selectedTypes.includes(cardType)

          return (
            <Button
              key={cardType}
              id={`lot-filter-${cardType}`}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => props.onTypeToggle(cardType)}
            >
              {t(`cardTypes.${cardType}`)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
