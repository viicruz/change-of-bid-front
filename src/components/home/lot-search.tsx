"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useQueryState } from "nuqs"
import type { ChangeEvent } from "react"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

//* Local imports
import {
  lotStatusFilterParser,
  lotStatusFilters,
} from "@/src/components/home/lot-filters"

export function LotSearch() {
  const t = useTranslations("pages./")
  const [query, setQuery] = useQueryState("query", { defaultValue: "" })
  const [status, setStatus] = useQueryState("status", lotStatusFilterParser)

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  function onStatusToggle(nextStatus: PublicLotStatus) {
    setStatus((current) => {
      if (current === nextStatus) {
        return null
      }

      return nextStatus
    })
  }

  return (
    <div className="flex w-fit max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-2 w-full max-w-103">
        <Label htmlFor="lot-search">{t("searchLabel")}</Label>
        <Input
          id="lot-search"
          type="search"
          value={query}
          placeholder={t("searchPlaceholder")}
          onChange={onChange}
        />
      </div>
      <div
        id="lot-filters"
        role="group"
        aria-label={t("filtersLabel")}
        className="flex flex-wrap gap-2"
      >
        {lotStatusFilters.map((filterStatus) => {
          const selected = status === filterStatus

          return (
            <Button
              key={filterStatus}
              id={`lot-filter-${filterStatus}`}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => onStatusToggle(filterStatus)}
            >
              {t(`filters.${filterStatus}`)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
