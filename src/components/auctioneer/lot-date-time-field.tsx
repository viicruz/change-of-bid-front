"use client"

//* Libraries imports
import { ChevronDownIcon } from "lucide-react"
import { useFormatter, useLocale } from "next-intl"
import { useState, type ChangeEvent } from "react"
import { enUS, ptBR } from "react-day-picker/locale"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

//* Local imports
import {
  applyCalendarDate,
  applyClockTime,
  dateTimeNotBefore,
  parseDateTimeLocal,
} from "@/src/lib/lots/lot-schedule"

const calendarEndMonth = new Date(2100, 11, 1)

const dayPickerLocales = {
  en: enUS,
  "pt-br": ptBR,
} as const

const dateButtonClassName =
  "h-13 w-full min-w-0 justify-between border-3 border-input bg-field px-3.5 font-semibold text-foreground shadow-none hover:translate-none active:translate-none focus-visible:shadow-hard-5 focus-visible:shadow-brand-yellow aria-invalid:border-brand-red data-[empty=true]:font-normal data-[empty=true]:text-muted-foreground"

const timeInputClassName =
  "font-semibold appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"

const dateFormat = {
  day: "2-digit",
  month: "short",
  year: "numeric",
} as const

function formatClock(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${hours}:${minutes}`
}

function startOfCalendarDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    startOfCalendarDay(left).getTime() === startOfCalendarDay(right).getTime()
  )
}

function calendarLocale(locale: string) {
  if (locale === "pt-br") {
    return dayPickerLocales["pt-br"]
  }

  return dayPickerLocales.en
}

type LotDateTimeFieldProps = {
  id: string
  value: string
  datePlaceholder: string
  timeLabel: string
  invalid?: boolean
  describedBy?: string
  //* Earliest allowed wall-clock value, used by the auction end
  minimum?: string
  onChange: (value: string) => void
  onBlur: () => void
}

export function LotDateTimeField(props: LotDateTimeFieldProps) {
  const locale = useLocale()
  const format = useFormatter()
  const selected = parseDateTimeLocal(props.value)
  const minimum = props.minimum ? parseDateTimeLocal(props.minimum) : null
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(
    () => selected ?? minimum ?? new Date()
  )
  const timeId = `${props.id}-time`
  const timeValue = selected ? formatClock(selected) : ""
  const timeMin =
    selected && minimum && isSameCalendarDay(selected, minimum)
      ? formatClock(minimum)
      : undefined

  function onOpenChange(next: boolean) {
    if (next) {
      setMonth(selected ?? minimum ?? new Date())
    }

    setOpen(next)
  }

  function commit(value: string) {
    props.onChange(dateTimeNotBefore(value, props.minimum))
  }

  function onSelectDate(date: Date | undefined) {
    if (!date) {
      return
    }

    commit(applyCalendarDate(props.value, date))
    setOpen(false)
  }

  function onTimeChange(event: ChangeEvent<HTMLInputElement>) {
    commit(applyClockTime(props.value, event.target.value))
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id={props.id}
              type="button"
              variant="outline"
              data-empty={selected ? undefined : true}
              data-value={props.value || undefined}
              aria-invalid={props.invalid ? true : undefined}
              aria-describedby={props.describedBy}
              className={dateButtonClassName}
              onBlur={props.onBlur}
            />
          }
        >
          {selected ? (
            format.dateTime(selected, dateFormat)
          ) : (
            <span>{props.datePlaceholder}</span>
          )}
          <ChevronDownIcon data-icon="inline-end" />
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selected ?? undefined}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            endMonth={calendarEndMonth}
            locale={calendarLocale(locale)}
            disabled={
              minimum ? { before: startOfCalendarDay(minimum) } : undefined
            }
            onSelect={onSelectDate}
          />
        </PopoverContent>
      </Popover>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={timeId} className="text-[13px]">
          {props.timeLabel}
        </Label>
        <Input
          id={timeId}
          type="time"
          step={60}
          value={timeValue}
          min={timeMin}
          disabled={!selected}
          autoComplete="off"
          aria-invalid={props.invalid ? true : undefined}
          aria-describedby={props.describedBy}
          className={timeInputClassName}
          onBlur={props.onBlur}
          onChange={onTimeChange}
        />
      </div>
    </div>
  )
}
