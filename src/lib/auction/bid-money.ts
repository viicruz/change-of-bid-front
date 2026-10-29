//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { ApiError } from "@/src/lib/api"

type BidPricing = Pick<
  ShowLot["lot"],
  "openingBid" | "currentBid" | "minIncrement"
>

export function moneyToNumber(value: string) {
  return Number(value)
}

//* Bid math runs in cents so increments never pick up float noise
export function moneyToCents(value: string) {
  return Math.round(Number(value) * 100)
}

export function centsToMoney(cents: number) {
  return (cents / 100).toFixed(2)
}

export function minimumBidCents(lot: BidPricing) {
  if (lot.currentBid === null) {
    return moneyToCents(lot.openingBid)
  }

  return moneyToCents(lot.currentBid) + moneyToCents(lot.minIncrement)
}

export const bidErrorMessageKey = {
  NOT_BIDDER: "bidErrors.NOT_BIDDER",
  LOT_NOT_FOUND: "bidErrors.LOT_NOT_FOUND",
  BID_BELOW_MINIMUM: "bidErrors.BID_BELOW_MINIMUM",
  INSUFFICIENT_BALANCE: "bidErrors.INSUFFICIENT_BALANCE",
  ALREADY_LEADER: "bidErrors.ALREADY_LEADER",
  LOT_NOT_STARTED: "bidErrors.LOT_NOT_STARTED",
  LOT_ENDED: "bidErrors.LOT_ENDED",
  LOT_CANCELED: "bidErrors.LOT_CANCELED",
} as const

type BidErrorCode = keyof typeof bidErrorMessageKey

export function isBidErrorCode(code: string): code is BidErrorCode {
  return code in bidErrorMessageKey
}

export function readBidErrorCode(error: unknown) {
  if (
    error instanceof ApiError &&
    typeof error.body === "object" &&
    error.body !== null &&
    "code" in error.body &&
    typeof error.body.code === "string" &&
    isBidErrorCode(error.body.code)
  ) {
    return error.body.code
  }

  return null
}
