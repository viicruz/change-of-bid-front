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
      </Card.Content>
    </Card.Root>
  )
}
