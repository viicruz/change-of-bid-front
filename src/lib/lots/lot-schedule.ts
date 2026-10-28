//* Helpers for the `datetime-local` fields of the create lot form.
//* Values are local wall-clock strings: "2026-10-29T20:00".

const dayMs = 24 * 60 * 60 * 1000
const defaultStartHour = 20

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export function toDateTimeLocal(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function parseDateTimeLocal(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)

  if (!match) {
    return null
  }

  const [, year, month, day, hours, minutes] = match.map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

//* Tomorrow at 20:00, when the evening auctions happen
export function defaultLotStart(now: Date) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    defaultStartHour,
    0
  )
}

//* End `days` after the start; without a start, it also returns the default one
export function scheduleForDuration(props: {
  startsAt: string
  days: number
  now: Date
}) {
  const start = parseDateTimeLocal(props.startsAt) ?? defaultLotStart(props.now)

  return {
    startsAt: toDateTimeLocal(start),
    endsAt: toDateTimeLocal(new Date(start.getTime() + props.days * dayMs)),
  }
}

export type LotDuration = {
  days: number
  hours: number
  minutes: number
}

export function lotDuration(
  startsAt: string,
  endsAt: string
): LotDuration | null {
  const start = parseDateTimeLocal(startsAt)
  const end = parseDateTimeLocal(endsAt)

  if (!start || !end) {
    return null
  }

  return durationBetween(start, end)
}

export function durationBetween(start: Date, end: Date): LotDuration | null {
  if (end <= start) {
    return null
  }

  const totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}
