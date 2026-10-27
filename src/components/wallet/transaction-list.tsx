"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

//* Schema imports
import type { WalletMovement } from "@/src/schemas/wallet"

const currencyFormat = {
  style: "currency",
  currency: "BRL",
} as const

const dateFormat = {
  dateStyle: "short",
  timeStyle: "short",
} as const

function signedMovementAmount(movement: WalletMovement) {
  const amount = Number(movement.amount)

  if (movement.type === "HOLD" || movement.type === "SETTLEMENT_DEBIT") {
    return -amount
  }

  return amount
}

export function TransactionList(props: { movements: WalletMovement[] }) {
  const t = useTranslations("pages./wallet")
  const format = useFormatter()

  return (
    <ul id="wallet-movements" className="flex w-full max-w-lg flex-col gap-3">
      {props.movements.map((movement) => (
        <li key={movement.id} id={`wallet-movement-${movement.id}`}>
          <Card.Root>
            <Card.Header>
              <Card.Title>{t(`movements.types.${movement.type}`)}</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-1">
              <p>
                {format.number(signedMovementAmount(movement), currencyFormat)}
              </p>
              <p className="text-muted-foreground">
                {format.dateTime(new Date(movement.createdAt), dateFormat)}
              </p>
            </Card.Content>
          </Card.Root>
        </li>
      ))}
    </ul>
  )
}
