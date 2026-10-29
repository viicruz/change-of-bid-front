//* Helpers for the create lot schedule.
//* Values are local wall-clock strings: "2026-10-29T20:00".

const minuteMs = 60 * 1000
const dayMs = 24 * 60 * minuteMs
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

//* Keep the clock time, or 20:00 when the field is still empty
export function applyCalendarDate(value: string, date: Date) {
  const current = parseDateTimeLocal(value)

  return toDateTimeLocal(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      current?.getHours() ?? defaultStartHour,
      current?.getMinutes() ?? 0
    )
  )
}

//* Change only the hours and minutes of a value that already has a date
export function applyClockTime(value: string, time: string) {
  const current = parseDateTimeLocal(value)
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time)

  if (!current || !match) {
    return value
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) {
    return value
  }

  return toDateTimeLocal(
    new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
      hours,
      minutes
    )
  )
}

//* The end of a lot cannot be earlier than its start
export function dateTimeNotBefore(value: string, minimum: string | undefined) {
  if (!minimum) {
    return value
  }

  const next = parseDateTimeLocal(value)
  const earliest = parseDateTimeLocal(minimum)

  if (!next || !earliest || next >= earliest) {
    return value
  }

  return minimum
}

//* A duration preset starts at the moment it is chosen
export function scheduleForDuration(props: {
  days?: number
  minutes?: number
  now: Date
}) {
  const durationMs = (props.days ?? 0) * dayMs + (props.minutes ?? 0) * minuteMs

  return {
    startsAt: toDateTimeLocal(props.now),
    endsAt: toDateTimeLocal(new Date(props.now.getTime() + durationMs)),
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
