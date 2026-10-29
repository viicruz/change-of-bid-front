"use client"

//* Libraries imports
import { useTranslations } from "next-intl";
import { LockIcon } from "lucide-react";
import type { ReactNode } from "react";

//* Components imports
import { Money } from "@/src/components/utils/money"

//* Types imports
import type { ShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet";

//* Utils imports
import { cn } from "@/src/lib/utils"

//* Committed money is always drawn with these red stripes, in the swatches and in the bar
const committedStripes =
  "bg-[repeating-linear-gradient(-45deg,var(--color-brand-red)_0_3px,var(--color-brand-red-dark)_3px_6px)]"

//* Big balances shrink to the room left beside the icon instead of leaking out of the tile
const fitBox = "@container min-w-0 flex-1"

type BalanceTileProps = {
  label: ReactNode
  value: ReactNode
  hint: ReactNode
  className?: string
  labelClassName?: string
  hintClassName?: string
}

function BalanceTile(props: BalanceTileProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 border-4 border-black p-5.5 shadow-hard-8",
        props.className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 text-sm font-bold tracking-[1px] uppercase",
          props.labelClassName
        )}
      >
        {props.label}
      </div>
      <div className="flex items-center gap-3 font-heading text-[clamp(34px,3.6vw,46px)] leading-[1.05] tabular-nums">
        {props.value}
      </div>
      <p className={cn("text-sm", props.hintClassName)}>{props.hint}</p>
    </div>
  )
}

export function BalanceCards(props: ShowWallet) {
  const t = useTranslations("pages./wallet")

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-7">
      <BalanceTile
        className="bg-brand-yellow text-brand-ink shadow-brand-red"
        hintClassName="font-semibold"
        label={
          <>
            <span aria-hidden="true" className="inline-block size-4 border-3 border-brand-ink bg-brand-yellow" />
            {t("availableBalance")}
          </>
        }
        value={<Money id="wallet-available-balance" fit className={fitBox} amount={props.availableBalance} />}
        hint={t("availableHint")}
      />
      <BalanceTile
        className="border-border bg-card text-card-foreground"
        labelClassName="text-muted-foreground"
        hintClassName="text-muted-foreground"
        label={
          <>
            <span aria-hidden="true" className={cn("inline-block size-4 border-3 border-black", committedStripes)} />
            {t("committedBalance")}
          </>
        }
        value={
          <>
            <LockIcon aria-hidden="true" className="size-7.5 shrink-0 text-brand-red" strokeWidth={3} strokeLinecap="square" />
            <Money id="wallet-committed-balance" fit className={fitBox} amount={props.committedBalance} />
          </>
        }
        hint={t("committedHint")}
      />
      <BalanceTile
        className="bg-brand-ink text-white shadow-brand-yellow"
        labelClassName="text-[#D9D4E0]"
        hintClassName="text-[#D9D4E0]"
        label={t("totalBalance")}
        value={<Money id="wallet-balance" fit className={cn(fitBox, "text-brand-yellow")} amount={props.totalBalance} />}
        hint={t("totalHint")}
      />
    </div>
  )
}

export function BalanceBar(props: ShowWallet) {
  const t = useTranslations("pages./wallet")
  const total = Number(props.totalBalance)
  const availablePercent =
    total > 0 ? Math.round((Number(props.availableBalance) / total) * 100) : 100
  const committedPercent = 100 - availablePercent

  return (
    <div className="flex flex-col gap-2.5">
      <div
        id="wallet-balance-bar"
        role="img"
        aria-label={t("balanceBar", {
          available: String(availablePercent),
          committed: String(committedPercent),
        })}
        className="flex h-7 border-4 border-border bg-muted"
      >
        <span
          className={cn(
            "block bg-brand-yellow",
            committedPercent > 0 && availablePercent > 0 && "border-r-4 border-black"
          )}
          style={{ width: `${availablePercent}%` }}
        />
        <span
          className="block bg-[repeating-linear-gradient(-45deg,var(--color-brand-red)_0_6px,var(--color-brand-red-dark)_6px_12px)]"
          style={{ width: `${committedPercent}%` }}
        />
      </div>
      <div
        aria-hidden="true"
        className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-muted-foreground"
      >
        <span className="flex items-center gap-2">
          <span className="inline-block size-3.5 border-2 border-black bg-brand-yellow" />
          {t("balanceShare", {
            label: t("availableBalance"),
            percent: String(availablePercent),
          })}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-3.5 border-2 border-black bg-brand-red" />
          {t("balanceShare", {
            label: t("committedBalance"),
            percent: String(committedPercent),
          })}
        </span>
      </div>
    </div>
  )
}
