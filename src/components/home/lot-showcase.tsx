"use client"

//* Libraries imports
import { useState } from "react"

//* Components imports
import { LotSearch } from "@/src/components/home/lot-search"
import { LotSection } from "@/src/components/home/lot-section"

//* Hooks imports
import { useDebounce } from "@/src/hooks/use-debounce"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

//* Lib imports
import type { CardType } from "@/src/lib/lots/mock-lots"

const searchDebounceMs = 300

const showcaseStatuses = [
  "LIVE",
  "SCHEDULED",
  "ENDED",
] as const satisfies readonly PublicLotStatus[]

export function LotShowcase() {
  const [query, setQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<CardType[]>([])
  const debouncedQuery = useDebounce(query, searchDebounceMs)

  function onTypeToggle(cardType: CardType) {
    setSelectedTypes((current) => {
      if (current.includes(cardType)) {
        return current.filter((type) => type !== cardType)
      }

      return [...current, cardType]
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <LotSearch
        query={query}
        selectedTypes={selectedTypes}
        onQueryChange={setQuery}
        onTypeToggle={onTypeToggle}
      />
      {showcaseStatuses.map((status) => (
        <LotSection key={status} status={status} query={debouncedQuery} />
      ))}
    </div>
  )
}
