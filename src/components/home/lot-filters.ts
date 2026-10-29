//* Libraries imports
import { parseAsStringLiteral } from "nuqs"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

export const lotStatusFilters = [
  "LIVE",
  "SCHEDULED",
  "ENDED",
] as const satisfies readonly PublicLotStatus[]

export const lotStatusFilterParser = parseAsStringLiteral(lotStatusFilters)
