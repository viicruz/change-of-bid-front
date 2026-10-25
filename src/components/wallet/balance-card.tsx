"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

export function BalanceCard(props: { balance: number }) {
  const t = useTranslations("pages./wallet")
  const format = useFormatter()

  return (
    <Card.Root className="w-full max-w-lg">
      <Card.Header>
        <Card.Title>{t("totalBalance")}</Card.Title>
      </Card.Header>
      <Card.Content>
        <p id="wallet-balance" className="font-heading text-2xl">
          {format.number(props.balance, currencyFormat)}
        </p>
      </Card.Content>
    </Card.Root>
  )
}
