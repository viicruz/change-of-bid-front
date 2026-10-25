"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

//* Lib imports
import type { WalletTransaction } from "@/src/lib/wallet/mock-wallet"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

export function TransactionList(props: { transactions: WalletTransaction[] }) {
  const t = useTranslations("pages./wallet")
  const format = useFormatter()

  return (
    <ul
      id="wallet-transactions"
      className="flex w-full max-w-lg flex-col gap-3"
    >
      {props.transactions.map((transaction) => (
        <li key={transaction.id} id={`wallet-transaction-${transaction.id}`}>
          <Card.Root>
            <Card.Header>
              <Card.Title>
                {t(`transactions.${transaction.descriptionKey}`)}
              </Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-1">
              <p>{format.number(transaction.amount, currencyFormat)}</p>
              <p className="text-muted-foreground">
                {format.dateTime(new Date(transaction.occurredAt), dateFormat)}
              </p>
            </Card.Content>
          </Card.Root>
        </li>
      ))}
    </ul>
  )
}
