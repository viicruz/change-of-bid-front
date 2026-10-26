"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { type ReactNode, type SubmitEvent } from "react"
import { useFormContext } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Local imports
import { useCreateLotMutation } from "@/src/components/auctioneer/create-lot-provider"
import {
  emptyCreateLotForm,
  toStoreLot,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"
import { ApiError } from "@/src/lib/api"

type CreateLotFormProps = {
  children: ReactNode
}

export function CreateLotForm(props: CreateLotFormProps) {
  const form = useFormContext<CreateLotFormValues>()
  const storeLot = useCreateLotMutation()

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    storeLot.reset()
    void form.handleSubmit((values) => {
      storeLot.mutate(toStoreLot(values), {
        onSuccess: () => {
          form.reset(emptyCreateLotForm)
        },
      })
    })(event)
  }

  return (
    <form
      id="create-lot-form"
      className="flex flex-1 flex-col"
      noValidate
      onSubmit={onSubmit}
    >
      {props.children}
    </form>
  )
}

export function CreateLotSubmit() {
  const t = useTranslations("pages./auctioneer")
  const translateError = useErrorTranslations()
  const storeLot = useCreateLotMutation()
  const apiMessage =
    storeLot.error instanceof ApiError
      ? storeLot.error.message
      : storeLot.error
        ? "00000_UNKNOWN_ERROR"
        : null

  return (
    <div className="flex flex-col gap-4">
      {storeLot.isSuccess ? (
        <p id="create-lot-success" role="status" className="text-sm">
          {t("created")}
        </p>
      ) : null}
      {apiMessage ? (
        <p
          id="create-lot-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {translateError(apiMessage)}
        </p>
      ) : null}
      <Button
        id="create-lot-submit"
        type="submit"
        className="w-full"
        disabled={storeLot.isPending}
      >
        {storeLot.isPending ? t("submitting") : t("submit")}
      </Button>
    </div>
  )
}
