export function parsePositiveAmount(value: string) {
  const amount = Number(value)

  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  return amount
}
