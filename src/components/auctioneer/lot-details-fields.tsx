"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

//* Components imports
import { LotField } from "@/src/components/auctioneer/lot-field"
import { Input } from "@/src/components/ui/input"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"

const textareaClassName =
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

export function LotDetailsFields() {
  const t = useTranslations("pages./auctioneer")
  const translateError = useErrorTranslations()
  const form = useFormContext<CreateLotFormValues>()
  const errors = form.formState.errors

  function errorMessage(code: string | undefined) {
    if (!code) {
      return undefined
    }

    return translateError(code)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <LotField
        id="lot-title"
        label={t("lotName")}
        error={errorMessage(errors.title?.message)}
      >
        <Input
          id="lot-title"
          type="text"
          autoComplete="off"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "lot-title-error" : undefined}
          {...form.register("title")}
        />
      </LotField>
      <LotField
        id="lot-description"
        label={t("lotDescription")}
        error={errorMessage(errors.description?.message)}
      >
        <textarea
          id="lot-description"
          rows={4}
          className={textareaClassName}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description ? "lot-description-error" : undefined
          }
          {...form.register("description")}
        />
      </LotField>
      <LotField
        id="lot-opening-bid"
        label={t("minimalValue")}
        error={errorMessage(errors.openingBid?.message)}
      >
        <Input
          id="lot-opening-bid"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={errors.openingBid ? true : undefined}
          aria-describedby={
            errors.openingBid ? "lot-opening-bid-error" : undefined
          }
          {...form.register("openingBid")}
        />
      </LotField>
      <LotField
        id="lot-min-increment"
        label={t("minimumIncrement")}
        error={errorMessage(errors.minIncrement?.message)}
      >
        <Input
          id="lot-min-increment"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={errors.minIncrement ? true : undefined}
          aria-describedby={
            errors.minIncrement ? "lot-min-increment-error" : undefined
          }
          {...form.register("minIncrement")}
        />
      </LotField>
      <LotField
        id="lot-starts-at"
        label={t("startsAt")}
        error={errorMessage(errors.startsAt?.message)}
      >
        <Input
          id="lot-starts-at"
          type="datetime-local"
          aria-invalid={errors.startsAt ? true : undefined}
          aria-describedby={errors.startsAt ? "lot-starts-at-error" : undefined}
          {...form.register("startsAt")}
        />
      </LotField>
      <LotField
        id="lot-ends-at"
        label={t("endsAt")}
        error={errorMessage(errors.endsAt?.message)}
      >
        <Input
          id="lot-ends-at"
          type="datetime-local"
          aria-invalid={errors.endsAt ? true : undefined}
          aria-describedby={errors.endsAt ? "lot-ends-at-error" : undefined}
          {...form.register("endsAt")}
        />
      </LotField>
    </div>
  )
}
