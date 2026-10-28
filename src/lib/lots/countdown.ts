//* Under ten minutes the timer turns red
export const endingSoonMs = 10 * 60 * 1000

function pad(value: number) {
  return String(value).padStart(2, "0")
}

/** `HH:MM:SS`, with a `Nd` prefix past one day. */
export function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const time = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  if (days > 0) {
    return `${String(days)}d ${time}`
  }

  return time
}
