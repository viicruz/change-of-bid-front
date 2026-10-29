"use client"

//* Libraries imports
import { useLocale } from "next-intl";
import { useMemo, type CSSProperties } from "react";

//* Utils imports
import { cn } from "@/src/lib/utils"

type MoneyProps = {
  amount: number | string
  id?: string
  className?: string
  //* Shrinks the amount to the width of the nearest `@container`
  fit?: boolean
}

type FitAmountProps = {
  children: string
  className?: string
}

/**
 * Keeps a formatted amount on one line, shrinking it below the inherited font size
 * only when it is wider than the nearest `@container`.
 * @param children - The formatted amount.
 */
export function FitAmount(props: FitAmountProps) {
  return (
    <span
      className={cn("amount-fit", props.className)}
      style={{ "--fit-chars": props.children.length } as CSSProperties}
    >
      {props.children}
    </span>
  )
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
    <span id={props.id} className={props.className}>
      <data value={props.amount}>
        {props.fit ? <FitAmount>{formattedAmount}</FitAmount> : formattedAmount}
      </data>
    </span>
  )
}
