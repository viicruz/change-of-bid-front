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
    <Card.Root className="w-full max-w-lg">
      <Card.Header>
        <Card.Title>{t("totalBalance")}</Card.Title>
      </Card.Header>
      <Card.Content>
        <p id="wallet-balance" className="font-heading text-2xl">
          <Money amount={props.totalBalance} />
        </p>
        <dl className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">{t("availableBalance")}</dt>
            <dd id="wallet-available-balance" className="font-medium">
              <Money amount={props.availableBalance} />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">{t("committedBalance")}</dt>
            <dd id="wallet-committed-balance" className="font-medium">
              <Money amount={props.committedBalance} />
            </dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>
  )
}
