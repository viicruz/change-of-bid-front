"use client"

//* Libraries imports
import { useState } from "react"

//* Components imports
import { LotSearch } from "@/src/components/home/lot-search"
import { LotSection } from "@/src/components/home/lot-section"

//* Lib imports
import {
  filterLots,
  lotStatuses,
  mockLots,
  type CardType,
} from "@/src/lib/lots/mock-lots"

export function LotShowcase() {
  const [query, setQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<CardType[]>([])
  const visibleLots = filterLots(mockLots, query, selectedTypes)

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
      {lotStatuses.map((status) => (
        <LotSection
          key={status}
          status={status}
          lots={visibleLots.filter((lot) => lot.status === status)}
        />
      ))}
    </div>
  )
}
