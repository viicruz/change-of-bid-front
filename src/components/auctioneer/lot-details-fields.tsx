"use client"

//* Libraries imports
import { useFormatter, useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

//* Components imports
import { LotDateTimeField } from "@/src/components/auctioneer/lot-date-time-field"
import { LotField } from "@/src/components/auctioneer/lot-field"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { MoneyInput } from "@/src/components/ui/money-input"

//* Hooks imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Local imports
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"
import { lotFieldDescribedBy } from "@/src/components/auctioneer/lot-field-described-by"
import { scheduleForDuration } from "@/src/lib/lots/lot-schedule"
import { cn } from "@/src/lib/utils"

const titleMaxLength = 80
const descriptionMaxLength = 500
const quickIncrements = [1, 5, 10] as const
const quickDurationMinutes = 5
const quickDurationDays = [1, 3, 5, 7] as const

const textareaClassName =
  "min-h-30 w-full min-w-0 resize-y rounded-none border-3 border-input bg-field px-3 py-2.5 text-[15px] leading-normal text-foreground transition-shadow duration-[120ms] outline-none placeholder:text-muted-foreground placeholder:opacity-80 focus:shadow-hard-5 focus:shadow-brand-yellow aria-invalid:border-brand-red motion-reduce:transition-none"

//* Same pressed look as the wallet presets: ink with yellow text
const chipClassName =
  "aria-pressed:border-black aria-pressed:bg-brand-ink aria-pressed:text-brand-yellow"

type MoneyFieldName = "openingBid" | "minIncrement"

function LotMoneyField(props: {
  id: string
  name: MoneyFieldName
  label: string
  error?: string
}) {
  const form = useFormContext<CreateLotFormValues>()

  return (
    <LotField id={props.id} label={props.label} error={props.error}>
      <div className="group/amount flex">
        <span
          aria-hidden="true"
          className="flex items-center border-3 border-r-0 border-input bg-brand-ink px-2.5 font-heading text-[15px] text-brand-yellow group-has-[[aria-invalid=true]]/amount:border-brand-red"
        >
          R$
        </span>
        <Controller
          control={form.control}
          name={props.name}
          render={({ field: { onChange, ...field } }) => (
            <MoneyInput
              {...field}
              id={props.id}
              prefix=""
              placeholder="0,00"
              autoComplete="off"
              className="px-2.5 font-heading text-lg"
              aria-invalid={props.error ? true : undefined}
              aria-describedby={lotFieldDescribedBy({
                id: props.id,
                error: props.error,
              })}
              onValueChange={onChange}
            />
          )}
        />
      </div>
    </LotField>
  )
}

export function LotDetailsFields() {
  const t = useTranslations("pages./auctioneer")
  const format = useFormatter()
  const translateError = useErrorTranslations()
  const form = useFormContext<CreateLotFormValues>()
  const errors = form.formState.errors
  const [title, description, startsAt, minIncrement] = useWatch({
    control: form.control,
    name: ["title", "description", "startsAt", "minIncrement"],
  })
  const setOptions = {
    shouldDirty: true,
    shouldValidate: form.formState.isSubmitted,
  }

  function errorMessage(code: string | undefined) {
    if (!code) {
      return undefined
    }

    return translateError(code)
  }

  function onQuickIncrement(amount: number) {
    form.setValue("minIncrement", amount.toFixed(2), setOptions)
  }

  function onQuickDuration(duration: { days?: number; minutes?: number }) {
    const schedule = scheduleForDuration({
      days: duration.days,
      minutes: duration.minutes,
      now: new Date(),
    })

    form.setValue("startsAt", schedule.startsAt, setOptions)
    form.setValue("endsAt", schedule.endsAt, setOptions)
  }

  return (
    <div className="flex w-full flex-col gap-4.5">
      <LotField
        id="lot-title"
        label={t("lotName")}
        hint={t("characterCount", {
          count: String(title.length),
          max: String(titleMaxLength),
        })}
        error={errorMessage(errors.title?.message)}
      >
        <Input
          id="lot-title"
          type="text"
          autoComplete="off"
          maxLength={titleMaxLength}
          placeholder={t("lotTitlePlaceholder")}
          className="font-semibold"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={lotFieldDescribedBy({
            id: "lot-title",
            hint: true,
            error: errors.title,
          })}
          {...form.register("title")}
        />
      </LotField>
      <LotField
        id="lot-description"
        label={t("lotDescription")}
        hint={t("characterCount", {
          count: String(description.length),
          max: String(descriptionMaxLength),
        })}
        error={errorMessage(errors.description?.message)}
      >
        <textarea
          id="lot-description"
          rows={5}
          maxLength={descriptionMaxLength}
          placeholder={t("lotDescriptionPlaceholder")}
          className={textareaClassName}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={lotFieldDescribedBy({
            id: "lot-description",
            hint: true,
            error: errors.description,
          })}
          {...form.register("description")}
        />
      </LotField>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-start gap-3.5">
        <LotMoneyField
          id="lot-opening-bid"
          name="openingBid"
          label={t("minimalValue")}
          error={errorMessage(errors.openingBid?.message)}
        />
        <div className="flex flex-col gap-2">
          <LotMoneyField
            id="lot-min-increment"
            name="minIncrement"
            label={t("minimumIncrement")}
            error={errorMessage(errors.minIncrement?.message)}
          />
          <div
            id="lot-quick-increments"
            role="group"
            aria-label={t("quickIncrements")}
            className="flex gap-1.5"
          >
            {quickIncrements.map((amount) => (
              <Button
                key={amount}
                id={`lot-quick-increment-${amount}`}
                type="button"
                size="xs"
                variant="outline"
                className={cn("min-w-0 flex-1 px-1", chipClassName)}
                aria-pressed={Number(minIncrement) === amount}
                onClick={() => onQuickIncrement(amount)}
              >
                {format.number(amount, {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 font-heading text-[15px]">
          {t("schedule")}
        </legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] items-start gap-3.5">
          <LotField
            id="lot-starts-at"
            label={t("startsAt")}
            error={errorMessage(errors.startsAt?.message)}
          >
            <Controller
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <LotDateTimeField
                  id="lot-starts-at"
                  value={field.value}
                  datePlaceholder={t("pickDate")}
                  timeLabel={t("scheduleTime")}
                  invalid={Boolean(errors.startsAt)}
                  describedBy={lotFieldDescribedBy({
                    id: "lot-starts-at",
                    error: errors.startsAt,
                  })}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </LotField>
          <LotField
            id="lot-ends-at"
            label={t("endsAt")}
            error={errorMessage(errors.endsAt?.message)}
          >
            <Controller
              control={form.control}
              name="endsAt"
              render={({ field }) => (
                <LotDateTimeField
                  id="lot-ends-at"
                  value={field.value}
                  datePlaceholder={t("pickDate")}
                  timeLabel={t("scheduleTime")}
                  minimum={startsAt || undefined}
                  invalid={Boolean(errors.endsAt)}
                  describedBy={lotFieldDescribedBy({
                    id: "lot-ends-at",
                    error: errors.endsAt,
                  })}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </LotField>
        </div>
        <div
          id="lot-quick-durations"
          role="group"
          aria-labelledby="lot-quick-durations-label"
          className="flex flex-wrap items-center gap-1.5"
        >
          <span
            id="lot-quick-durations-label"
            className="mr-1 text-xs font-bold text-muted-foreground uppercase"
          >
            {t("quickDuration")}
          </span>
          <Button
            id={`lot-quick-duration-${quickDurationMinutes}m`}
            type="button"
            size="xs"
            variant="outline"
            aria-label={t("quickDurationMinutes", {
              minutes: String(quickDurationMinutes),
            })}
            onClick={() => onQuickDuration({ minutes: quickDurationMinutes })}
          >
            {t("quickDurationMinutesShort", {
              minutes: String(quickDurationMinutes),
            })}
          </Button>
          {quickDurationDays.map((days) => (
            <Button
              key={days}
              id={`lot-quick-duration-${days}`}
              type="button"
              size="xs"
              variant="outline"
              aria-label={t("quickDurationDays", { days })}
              onClick={() => onQuickDuration({ days })}
            >
              {t("quickDurationShort", { days: String(days) })}
            </Button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
