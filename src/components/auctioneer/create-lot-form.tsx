"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { GavelIcon } from "lucide-react"
import { type ReactNode, type SubmitEvent } from "react"
import { useFormContext, type FieldErrors } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Schema imports
import type { Lot } from "@/src/schemas/lot"

//* Local imports
import { useCreateLotMutation } from "@/src/components/auctioneer/create-lot-provider"
import {
  emptyCreateLotForm,
  toStoreLot,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"
import { ApiError } from "@/src/lib/api"
import { cn } from "@/src/lib/utils"

type CreateLotFormProps = {
  className?: string
  //* Runs when the submit stops on validation errors
  onInvalid?: (errors: FieldErrors<CreateLotFormValues>) => void
  //* Runs after the API stores the lot, before the form is cleared
  onCreated?: (lot: Lot) => void
  //* Runs when the API rejects the lot; its error shows by the submit button
  onRejected?: () => void
  children: ReactNode
}

export function CreateLotForm(props: CreateLotFormProps) {
  const form = useFormContext<CreateLotFormValues>()
  const storeLot = useCreateLotMutation()

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    storeLot.reset()
    void form.handleSubmit((values) => {
      storeLot.mutate(toStoreLot(values), {
        onSuccess: (lot) => {
          props.onCreated?.(lot)
          form.reset(emptyCreateLotForm)
        },
        onError: () => {
          props.onRejected?.()
        },
      })
    }, props.onInvalid)(event)
  }

  return (
    <form
      id="create-lot-form"
      className={cn("flex flex-1 flex-col", props.className)}
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
    <div className="flex flex-col gap-3">
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
        size="lg"
        //* Phones publish from the bar at the bottom (AuctioneerMobileBar)
        className="w-full max-[760px]:hidden"
        disabled={storeLot.isPending}
      >
        <GavelIcon data-icon="inline-start" aria-hidden="true" />
        {storeLot.isPending ? t("submitting") : t("submit")}
      </Button>
      <p
        id="create-lot-note"
        className="text-center text-xs text-muted-foreground"
      >
        {t("createNote")}
      </p>
    </div>
  )
}
