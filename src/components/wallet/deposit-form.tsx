"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { type SubmitEvent } from "react"
import { useForm } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"
import Card from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { FormError } from "@/src/components/utils/form-error"

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
  const storeDeposit = useStoreDeposit()
  const form = useForm({
    resolver: zodResolver(storeDepositSchema),
    defaultValues: { amount: "" },
  })
  const amountError = form.formState.errors.amount?.message
  const requestErrorCode = storeDeposit.isError
    ? readDepositErrorCode(storeDeposit.error)
    : null

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    storeDeposit.reset()
    void form.handleSubmit((values) => {
      storeDeposit.mutate(values, {
        onSuccess: () => {
          form.reset({ amount: "" })
          props.onDeposited()
        },
      })
    })(event)
  }

  const errorCode = amountError ?? requestErrorCode

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
              aria-invalid={errorCode ? true : undefined}
              aria-describedby={errorCode ? "deposit-error" : undefined}
              disabled={storeDeposit.isPending}
              {...form.register("amount", {
                onChange: () => {
                  if (storeDeposit.isError) storeDeposit.reset()
                },
              })}
            />
          </div>
          <FormError
            id="deposit-error"
            code={
              errorCode && knownDepositErrorCodes.has(errorCode)
                ? errorCode
                : errorCode
                  ? "00000_UNKNOWN_ERROR"
                  : null
            }
            fallback={errorCode ? t("depositError") : undefined}
          />
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
