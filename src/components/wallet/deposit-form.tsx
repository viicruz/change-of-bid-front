"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { MoneyInput } from "@/src/components/ui/money-input"
import { Label } from "@/src/components/ui/label"
import { FormError } from "@/src/components/utils/form-error"
import { Money } from "@/src/components/utils/money"

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

const depositPresets = ["50.00", "100.00", "200.00", "500.00"]

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

type DepositFormProps = {
  onDeposited: (amount: string) => void
  onCancel?: () => void
  availableBalance?: string
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

  //* The form only exists while the panel is open: start typing right away
  useEffect(() => {
    form.setFocus("amount")
  }, [form])

  const onSubmit = form.handleSubmit((data) => {
    storeDeposit.reset();
    storeDeposit.mutate(data, {
      onSuccess: () => {
        form.reset({ amount: "" })
        props.onDeposited(data.amount)
      },
    });
  })

  function onPresetClick(amount: string) {
    form.setValue("amount", amount)
    form.clearErrors("amount")
    if (storeDeposit.isError) storeDeposit.reset()
  }

  const errorCode = amountError ?? requestErrorCode

  return (
    <form
      id="deposit-form"
      className="flex flex-col gap-[18px] border-4 border-border bg-card p-6 text-card-foreground shadow-[10px_10px_0_var(--color-brand-red)]"
      aria-labelledby="deposit-title"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="deposit-title" className="font-heading text-2xl font-normal">
          {t("depositTitle")}
        </h2>
        {props.availableBalance ? (
          <p className="text-sm text-muted-foreground">
            {t("availableBalance")}:{" "}
            <strong className="text-foreground">
              <Money amount={props.availableBalance} />
            </strong>
          </p>
        ) : null}
      </div>
      <div
        role="group"
        aria-label={t("depositPresets")}
        className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5"
      >
        {depositPresets.map((amount) => (
          <Button
            key={amount}
            id={`deposit-preset-${amount}`}
            type="button"
            variant="outline"
            disabled={storeDeposit.isPending}
            className="h-12 border-3 border-input bg-card px-2.5 text-[15px] text-foreground shadow-hard-3"
            onClick={() => onPresetClick(amount)}
          >
            <Money amount={amount} />
          </Button>
        ))}
      </div>
      <div className="flex max-w-105 flex-col gap-2">
        <Label
          htmlFor="deposit-amount"
          className="text-[13px] font-bold tracking-[1px] uppercase"
        >
          {t("depositAmountLabel")}
        </Label>
        <div className="group/amount flex">
          <span
            aria-hidden="true"
            className="flex items-center border-3 border-r-0 border-input bg-brand-ink px-3.5 font-heading text-lg text-brand-yellow group-has-[[aria-invalid=true]]/amount:border-brand-red"
          >
            R$
          </span>
          <Controller
            control={form.control}
            name="amount"
            render={({ field: { onChange, ...field } }) => (
              <MoneyInput
                {...field}
                id="deposit-amount"
                prefix=""
                placeholder="0"
                autoComplete="off"
                className="h-14 font-heading text-[22px]"
                aria-invalid={errorCode ? true : undefined}
                aria-describedby={errorCode ? "deposit-error" : undefined}
                disabled={storeDeposit.isPending}
                onValueChange={(value) => {
                  onChange(value)
                  // avoid re-fetching the wallet if the deposit fails
                  if (storeDeposit.isError) storeDeposit.reset()
                }}
              />
            )}
          />
        </div>
        <FormError
          id="deposit-error"
          className="text-sm font-bold text-red-text"
          code={
            errorCode && knownDepositErrorCodes.has(errorCode)
              ? errorCode
              : errorCode
                ? "00000_UNKNOWN_ERROR"
                : null
          }
          fallback={errorCode ? t("depositError") : undefined}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          id="deposit-submit"
          type="submit"
          disabled={storeDeposit.isPending}
          className="shadow-hard-5 shadow-brand-yellow"
        >
          {storeDeposit.isPending
            ? t("depositSubmitting")
            : t("depositSubmit")}
        </Button>
        {props.onCancel ? (
          <Button
            id="deposit-cancel"
            type="button"
            variant="ghost"
            className="h-13 border-3 border-input px-[18px] text-[15px] tracking-normal normal-case"
            onClick={props.onCancel}
          >
            {t("depositCancel")}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
