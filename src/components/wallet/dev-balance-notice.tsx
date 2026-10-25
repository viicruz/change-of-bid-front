"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState, type ChangeEvent, type SubmitEvent } from "react"

//* Components imports
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import { parsePositiveAmount } from "@/src/lib/wallet/mock-wallet"

type DevBalanceNoticeProps = {
  onAddBalance: (amount: number) => void
}

export function DevBalanceNotice(props: DevBalanceNoticeProps) {
  const t = useTranslations("pages./wallet")
  const [amount, setAmount] = useState("")

  function onAmountChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value)
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = parsePositiveAmount(amount)

    if (parsedAmount === null) {
      return
    }

    props.onAddBalance(parsedAmount)
    setAmount("")
  }

  return (
    <Card.Root className="w-full max-w-lg">
      <Card.Content>
        <form
          id="dev-balance-form"
          className="flex flex-col gap-3"
          onSubmit={onSubmit}
        >
          <p>{t("devNotice")}</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dev-balance-amount">{t("devAmountLabel")}</Label>
            <Input
              id="dev-balance-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={onAmountChange}
            />
          </div>
          <Button id="dev-balance-submit" type="submit">
            {t("devSubmit")}
          </Button>
        </form>
      </Card.Content>
    </Card.Root>
  )
}
