"use client"

//* Libraries imports
import { useQueryState } from "nuqs"

//* Components imports
import { LotSearch } from "@/src/components/home/lot-search"
import { LotSection } from "@/src/components/home/lot-section"

//* Hooks imports
import { useDebounce } from "@/src/hooks/use-debounce"

//* Local imports
import {
  lotStatusFilterParser,
  lotStatusFilters,
} from "@/src/components/home/lot-filters"

const searchDebounceMs = 300

export function LotShowcase() {
  const [query] = useQueryState("query", { defaultValue: "" })
  const [status] = useQueryState("status", lotStatusFilterParser)
  const debouncedQuery = useDebounce(query, searchDebounceMs)
  const visibleStatuses = status === null ? lotStatusFilters : [status]

  return (
    <>
      {/* Search and status filters apply together to the sections below */}
      <div className="flex w-full justify-center bg-bg-alt px-[clamp(16px,4vw,48px)] pt-20 pb-8">
        <LotSearch />
      </div>
      {visibleStatuses.map((sectionStatus) => (
        <LotSection
          key={sectionStatus}
          status={sectionStatus}
          query={debouncedQuery}
        />
      ))}
    </>
  )
}
