"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState, type ChangeEvent, type SubmitEvent } from "react"

//* Components imports
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"
import {
  storeDepositSchema,
  useStoreDeposit,
} from "@/src/hooks/wallets/mutations/use-store-deposit"

//* Local imports
import { ApiError } from "@/src/lib/api"

const knownDepositErrorCodes = new Set([
  "INVALID_MONEY",
  "NOT_BIDDER",
  "WALLET_NOT_FOUND",
  "AMOUNT_OUT_OF_RANGE",
])

type DepositFormProps = {
  onDeposited: () => void
}

function readDepositErrorCode(error: unknown) {
  if (
    error instanceof ApiError &&
    typeof error.body === "object" &&
    error.body !== null &&
    "code" in error.body &&
    typeof error.body.code === "string" &&
    error.body.code.length > 0
  ) {
    return error.body.code
  }

  return "DEPOSIT_FAILED"
}

export function DepositForm(props: DepositFormProps) {
  const t = useTranslations("pages./wallet")
  const translateError = useErrorTranslations()
  const storeDeposit = useStoreDeposit()
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState<string | null>(null)
  const requestErrorCode = storeDeposit.isError
    ? readDepositErrorCode(storeDeposit.error)
    : null
  const errorCode = amountError ?? requestErrorCode

  function errorMessage(code: string) {
    if (knownDepositErrorCodes.has(code)) {
      return translateError(code)
    }

    return t("depositError")
  }

  function onAmountChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value)
    setAmountError(null)

    if (storeDeposit.isError) {
      storeDeposit.reset()
    }
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    storeDeposit.reset()

    const parsed = storeDepositSchema.safeParse({ amount })

    if (!parsed.success) {
      setAmountError(parsed.error.issues[0]?.message ?? "INVALID_MONEY")
      return
    }

    setAmountError(null)
    storeDeposit.mutate(parsed.data, {
      onSuccess: () => {
        setAmount("")
        props.onDeposited()
      },
    })
  }

  return (
    <Card.Root className="w-full max-w-lg">
      <Card.Content>
        <form
          id="deposit-form"
          className="flex flex-col gap-3"
          noValidate
          onSubmit={onSubmit}
        >
          <p>{t("depositDescription")}</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deposit-amount">{t("depositAmountLabel")}</Label>
            <Input
              id="deposit-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              aria-invalid={errorCode ? true : undefined}
              aria-describedby={errorCode ? "deposit-error" : undefined}
              disabled={storeDeposit.isPending}
              onChange={onAmountChange}
            />
          </div>
          {errorCode ? (
            <p
              id="deposit-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errorMessage(errorCode)}
            </p>
          ) : null}
          <Button
            id="deposit-submit"
            type="submit"
            disabled={storeDeposit.isPending}
          >
            {storeDeposit.isPending
              ? t("depositSubmitting")
              : t("depositSubmit")}
          </Button>
        </form>
      </Card.Content>
    </Card.Root>
  )
}
