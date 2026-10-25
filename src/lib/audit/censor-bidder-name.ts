export function censorBidderName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)

  return parts
    .map((part) => {
      const initial = part.slice(0, 1)
      const mask = "*".repeat(part.length - 1)

      return `${initial}${mask}`
    })
    .join(" ")
}
