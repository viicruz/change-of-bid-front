"use client"

//* Libraries imports
import { useTranslations } from "next-intl";

//* Components imports
import Card from "@/src/components/ui/card"
import { Money } from "@/src/components/utils/money"

//* Types imports
import type { ShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet";

export function BalanceCard(props: ShowWallet) {
  const t = useTranslations("pages./wallet")

  return (
    <Card.Root className="w-full">
      <Card.Header>
        <Card.Title>{t("availableBalance")}</Card.Title>
      </Card.Header>
      <Card.Content>
        <p id="wallet-available-balance" className="font-heading text-3xl font-semibold text-primary tabular-nums">
          <Money amount={props.availableBalance} />
        </p>
        <dl className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">{t("totalBalance")}</dt>
            <dd id="wallet-balance" className="font-medium tabular-nums">
              <Money amount={props.totalBalance} />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">{t("committedBalance")}</dt>
            <dd id="wallet-committed-balance" className="font-medium tabular-nums">
              <Money amount={props.committedBalance} />
            </dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>
  )
}
