"use client"

import { useLocale } from "next-intl"
import type { ComponentProps } from "react"
import { NumericFormat } from "react-number-format"

import { Input } from "@/src/components/ui/input"

export type MoneyInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "inputMode" | "value" | "defaultValue" | "onChange"
> & {
  /** Unformatted decimal string (e.g. "1234.56"), or "" for an empty input. */
  value: string
  onValueChange: (value: string) => void
  locale?: string
  /** Text drawn inside the field before the amount. Pass "" when the field has its own visual prefix. */
  prefix?: string
}

/** BRL only. Values stay as decimal strings to preserve monetary precision. */
export function MoneyInput({
  value,
  onValueChange,
  locale,
  prefix = "R$ ",
  ref,
  onPaste,
  onDrop,
  ...props
}: MoneyInputProps) {
  const appLocale = useLocale()
  const parts = new Intl.NumberFormat(locale ?? appLocale).formatToParts(1234.5)
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? "."
  const group = parts.find((part) => part.type === "group")?.value ?? ","
  const escape = (separator: string) =>
    separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pastedAmount = new RegExp(
    `^(?:R\\$\\s*)?(?:\\d+|\\d{1,3}(?:${escape(group)}\\d{3})+)(?:${escape(decimal)}\\d{1,2})?$`
  )

  return (
    <NumericFormat
      {...props}
      customInput={Input}
      getInputRef={ref}
      type="text"
      inputMode="decimal"
      value={value}
      valueIsNumericString
      prefix={prefix}
      thousandSeparator={group}
      decimalSeparator={decimal}
      allowedDecimalSeparators={[decimal]}
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      isAllowed={({ value: nextValue }) => nextValue.split(".")[0].length <= 16}
      onValueChange={({ value: nextValue }, { source }) => {
        if (source !== "event") return

        if (!nextValue) {
          onValueChange("")
          return
        }

        const [integer, fraction = ""] = nextValue.split(".")
        onValueChange(
          `${integer.replace(/^0+(?=\d)/, "") || "0"}.${fraction.padEnd(2, "0")}`
        )
      }}
      onPaste={(event) => {
        onPaste?.(event)
        // Reject malformed amounts instead of silently converting e.g. -10 or 1e3.
        if (!pastedAmount.test(event.clipboardData.getData("text").trim())) {
          event.preventDefault()
        }
      }}
      onDrop={(event) => {
        onDrop?.(event)
        if (!pastedAmount.test(event.dataTransfer.getData("text").trim())) {
          event.preventDefault()
        }
      }}
    />
  )
}
