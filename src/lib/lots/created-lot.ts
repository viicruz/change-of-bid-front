//* Schema imports
import type { Lot } from "@/src/schemas/lot"

//* A lot whose start already passed opens right away and lists as live
export function createdLotStatus(lot: Lot, now: number) {
  return lot.startsAt.getTime() > now ? "SCHEDULED" : "LIVE"
}
