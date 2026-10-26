"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import type { SubmitEvent } from "react"

//* Components imports
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import type { AuctioneerLot } from "@/src/lib/auctioneer/mock-auctioneer"

function toDateTimeLocal(value: string) {
  return value.slice(0, 16)
}

function onSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault()
}

type AssistanceMenuProps = {
  lot: AuctioneerLot
  idPrefix?: string
  showTitle?: boolean
}

export function AssistanceMenu(props: AssistanceMenuProps) {
  const t = useTranslations("pages./auctioneer")
  const idPrefix = props.idPrefix ?? ""
  const showTitle = props.showTitle ?? true

  return (
    <form
      id={`${idPrefix}assistance-menu`}
      className="flex w-full flex-col gap-4"
      onSubmit={onSubmit}
    >
      {showTitle ? (
        <h2
          id={`${idPrefix}assistance-menu-title`}
          className="text-center font-heading text-base font-medium"
        >
          {t("assistanceMenu")}
        </h2>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}lot-title`}>{t("lotName")}</Label>
        <Input
          id={`${idPrefix}lot-title`}
          name="title"
          type="text"
          defaultValue={props.lot.title}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}lot-description`}>
          {t("lotDescription")}
        </Label>
        <textarea
          id={`${idPrefix}lot-description`}
          name="description"
          rows={4}
          defaultValue={props.lot.description}
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}lot-minimal-value`}>
          {t("minimalValue")}
        </Label>
        <Input
          id={`${idPrefix}lot-minimal-value`}
          name="minimalValue"
          type="number"
          min={0}
          step={1}
          defaultValue={props.lot.minimalValue}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}lot-minimum-increment`}>
          {t("minimumIncrement")}
        </Label>
        <Input
          id={`${idPrefix}lot-minimum-increment`}
          name="minimumIncrement"
          type="number"
          min={0}
          step={1}
          defaultValue={props.lot.minimumIncrement}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}lot-starts-at`}>{t("startsAt")}</Label>
        <Input
          id={`${idPrefix}lot-starts-at`}
          name="startsAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(props.lot.startsAt)}
        />
      </div>
    </form>
  )
}
