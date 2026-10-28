"use client"

//* Libraries imports
import { useState } from "react"

//* Components imports
import { LotSearch } from "@/src/components/home/lot-search"
import { LotSection } from "@/src/components/home/lot-section"

//* Hooks imports
import { useDebounce } from "@/src/hooks/use-debounce"

const searchDebounceMs = 300

export function LotShowcase() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, searchDebounceMs)

  return (
    <>
      {/* The search sits in the first section and filters all three */}
      <LotSection status="LIVE" query={debouncedQuery}>
        <LotSearch query={query} onQueryChange={setQuery} />
      </LotSection>
      <LotSection status="SCHEDULED" query={debouncedQuery} />
      <LotSection status="ENDED" query={debouncedQuery} />
    </>
  )
}
