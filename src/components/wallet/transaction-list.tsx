"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

//* Components imports
import { Badge } from "@/src/components/ui/badge"
import { Money } from "@/src/components/utils/money"
import { FormattedDate } from "@/src/components/utils/date"

//* Schema imports
import type { WalletMovement, WalletMovementType } from "@/src/schemas/wallet"

//* Utils imports
import { cn } from "@/src/lib/utils"

//* How each movement moves money between the two balances: +1 adds, -1 takes, 0 leaves it alone
const movementEffects: Record<
  WalletMovementType,
  { available: -1 | 0 | 1; committed: -1 | 0 | 1 }
> = {
  DEPOSIT: { available: 1, committed: 0 },
  HOLD: { available: -1, committed: 1 },
  RELEASE: { available: 1, committed: -1 },
  SETTLEMENT_DEBIT: { available: 0, committed: -1 },
  SETTLEMENT_CREDIT: { available: 1, committed: 0 },
}

const movementBadges: Record<WalletMovementType, string> = {
  DEPOSIT: "bg-brand-yellow text-brand-ink",
  HOLD: "bg-brand-ink text-brand-yellow",
  RELEASE: "bg-white text-brand-ink",
  SETTLEMENT_DEBIT: "bg-brand-red text-white",
  SETTLEMENT_CREDIT: "border-border bg-transparent text-foreground",
}

const dateOptions = {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
} as const

const headCell =
  "border-b-4 border-black bg-brand-ink px-4 py-3 text-left text-xs font-bold tracking-[1px] whitespace-nowrap text-white uppercase"
const numberCell = "text-right whitespace-nowrap tabular-nums"

type MovementDeltaProps = {
  amount: string
  sign: -1 | 0 | 1
  tone: "available" | "committed"
}

function MovementDelta(props: MovementDeltaProps) {
  if (props.sign === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <span
      className={cn(
        props.tone === "committed"
          ? "text-yellow-text"
          : props.sign < 0
            ? "text-red-text"
            : "text-foreground"
      )}
    >
      {props.sign > 0 ? "+" : "−"} <Money amount={props.amount} />
    </span>
  )
}

type TransactionListProps = {
  movements: WalletMovement[]
}

export function TransactionList(props: TransactionListProps) {
  const t = useTranslations("pages./wallet")

  return (
    <table id="wallet-movements" className="w-full min-w-205 border-collapse">
      <thead>
        <tr>
          <th scope="col" className={headCell}>{t("movements.columns.date")}</th>
          <th scope="col" className={headCell}>{t("movements.columns.description")}</th>
          <th scope="col" className={headCell}>{t("movements.columns.type")}</th>
          <th scope="col" className={cn(headCell, "text-right")}>{t("movements.columns.available")}</th>
          <th scope="col" className={cn(headCell, "text-right")}>{t("movements.columns.committed")}</th>
        </tr>
      </thead>
      <tbody>
        {props.movements.map((movement) => {
          const effect = movementEffects[movement.type]

          return (
            <tr
              key={movement.id}
              id={`wallet-movement-${movement.id}`}
              className="border-b-3 border-line-soft text-[15px] last:border-b-0 [&>td]:px-4 [&>td]:py-3.5 [&>td]:align-middle"
            >
              <td className="text-sm font-semibold whitespace-nowrap text-muted-foreground uppercase">
                <FormattedDate value={movement.createdAt} options={dateOptions} />
              </td>
              <td className="font-semibold">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {t(`movements.descriptions.${movement.type}`)}
                  {movement.lotId ? (
                    <Link
                      href={`/auction/${movement.lotId}`}
                      className="flex items-center gap-1 font-heading text-xs text-red-text no-underline hover:text-foreground"
                    >
                      {t("movements.viewLot")}
                      <ArrowRightIcon aria-hidden="true" className="size-3.5" strokeWidth={3} strokeLinecap="square" />
                    </Link>
                  ) : null}
                </span>
              </td>
              <td>
                <Badge className={cn("h-auto px-2 py-1", movementBadges[movement.type])}>
                  {t(`movements.types.${movement.type}`)}
                </Badge>
              </td>
              <td className={cn(numberCell, "font-heading")}>
                <MovementDelta amount={movement.amount} sign={effect.available} tone="available" />
              </td>
              <td className={cn(numberCell, "font-heading")}>
                <MovementDelta amount={movement.amount} sign={effect.committed} tone="committed" />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
