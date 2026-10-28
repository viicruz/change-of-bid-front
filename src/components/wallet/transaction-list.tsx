"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react"

//* Components imports
import Card from "@/src/components/ui/card"
import { Money } from "@/src/components/utils/money"
import { FormattedDate } from "@/src/components/utils/date"

//* Schema imports
import type { WalletMovement } from "@/src/schemas/wallet"

//* Utils imports
import { cn } from "@/src/lib/utils"

function signedMovementAmount(movement: WalletMovement) {
  const amount = Number(movement.amount)

  if (movement.type === "HOLD" || movement.type === "SETTLEMENT_DEBIT") {
    return -amount
  }

  return amount
}

type TransactionListProps = {
  movements: WalletMovement[];
}

export function TransactionList(props: TransactionListProps) {
  const t = useTranslations("pages./wallet")

  return (
    <ul id="wallet-movements" className="flex w-full flex-col gap-3">
      {props.movements.map((movement) => {
        const amount = signedMovementAmount(movement)
        const isIncoming = amount >= 0
        const MovementIcon = isIncoming ? ArrowDownLeft : ArrowUpRight

        return (
          <li key={movement.id} id={`wallet-movement-${movement.id}`}>
            <Card.Root className="relative gap-0 border border-border/70 py-0 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none h-20">
              <div
                className={cn("absolute inset-y-0 left-0 w-1", isIncoming ? "bg-emerald-500" : "bg-amber-500")}
                aria-hidden="true"
              />
              <Card.Content className="flex items-center gap-4 py-4 pl-5">
                <span
                  className={cn("grid size-11 shrink-0 place-items-center rounded-full", isIncoming ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400")}
                  aria-hidden="true"
                >
                  <MovementIcon className="size-5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <Card.Title className="truncate text-sm font-semibold">
                      {t(`movements.types.${movement.type}`)}
                    </Card.Title>
                    <p
                      className={cn("font-heading text-base font-semibold tabular-nums", isIncoming ? "text-emerald-700 dark:text-emerald-400" : "text-foreground")}
                    >
                      {isIncoming ? "+" : "−"}{" "}
                      <Money amount={Math.abs(amount)} />
                    </p>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
                    <FormattedDate value={movement.createdAt} />
                  </p>
                </div>
              </Card.Content>
            </Card.Root>
          </li>
        )
      })}
    </ul>
  )
}
