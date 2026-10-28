"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import type { ChangeEvent } from "react"

//* Components imports
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

type LotSearchProps = {
  query: string
  onQueryChange: (query: string) => void
}

export function LotSearch(props: LotSearchProps) {
  const t = useTranslations("pages./")

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    props.onQueryChange(event.target.value)
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="lot-search">{t("searchLabel")}</Label>
      <Input
        id="lot-search"
        type="search"
        value={props.query}
        placeholder={t("searchPlaceholder")}
        onChange={onChange}
      />
    </div>
  )
}
