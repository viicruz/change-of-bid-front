"use client"

import { useFormatter } from "next-intl"
import type { DateTimeFormatOptions } from "use-intl/core"

type DateProps = {
  value: Date | string | number
  className?: string
  options?: DateTimeFormatOptions
}

const defaultOptions: DateTimeFormatOptions = {
  day: "numeric",
  month: "2-digit",
  year: "numeric",
}

/** Formats a date using the active application locale. */
export function FormattedDate(props: DateProps) {
  const formatter = useFormatter()
  const date = props.value instanceof Date ? props.value : new Date(props.value)

  return (
    <time dateTime={date.toISOString()} className={props.className}>
      {formatter.dateTime(date, props.options ?? defaultOptions)}
    </time>
  )
}
