//* The API rejects deposits, opening bids, increments and bids above BRL 1000000.00
export const maxMoneyAmount = 1_000_000

/**
 * Checks a decimal money string against the API limit.
 * Malformed amounts pass here and are left to the format check.
 */
export function isWithinMoneyLimit(value: string) {
  return !(Number(value) > maxMoneyAmount)
}
