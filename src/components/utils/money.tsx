"use client"

//* Libraries imports
import { useFormatter } from "next-intl";

type MoneyProps = {
    amount: number | string;
    className?: string;
}

/**
 * Formats a money amount to a string with the currency symbol and the amount.
 * @param amount - The amount to format.
 * @returns The formatted money amount.
 */

export function Money(props: MoneyProps) {
    const formatter = useFormatter();

    const parsedAmount = typeof props.amount === "string" ? parseFloat(props.amount) : props.amount;
    const formattedAmount = formatter.number(parsedAmount, { style: "currency", currency: "BRL" });

    return (
        <span className={props.className}>
            <data value={parsedAmount}>{formattedAmount}</data>
        </span>
    );
}