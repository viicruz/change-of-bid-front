"use client"

//* Libraries imports
import { useLocale } from "next-intl";
import { useMemo } from "react";

type MoneyProps = {
  amount: number | string
  className?: string
}

/**
 * Formats a money amount to a string with the currency symbol and the amount.
 * @param amount - The amount to format.
 * @returns The formatted money amount.
 */

export function Money(props: MoneyProps) {
  const locale = useLocale()
  const formatter = useMemo(() => new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }), [locale])
  // Intl.NumberFormat accepts decimal strings exactly; its TypeScript lib type
  // still only allows number and bigint, so preserve the string at runtime.
  const formattedAmount =
    typeof props.amount === "string"
      ? (formatter.format as unknown as (value: string) => string)(props.amount)
      : formatter.format(props.amount)

  return (
    <span className={props.className}>
      <data value={props.amount}>{formattedAmount}</data>
    </span>
  )
}
