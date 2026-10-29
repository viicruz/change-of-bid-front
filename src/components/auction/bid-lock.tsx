"use client"

//* Libraries imports
import { LockIcon } from "lucide-react"
import { useTranslations } from "next-intl"

//* Components imports
import { buttonVariants } from "@/src/components/ui/button"

type BidLockProps = {
  id: string
  message: string
  actionHref?: string
  actionLabel?: string
}

export function BidLock(props: BidLockProps) {
  const t = useTranslations("pages./auction/[id]")

  return (
    <div id={props.id} className="relative">
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none flex flex-col gap-4 blur-sm select-none"
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("yourBid")}</span>
          <div className="h-13 border-3 border-input bg-field" />
        </div>
        <div className="flex h-13 items-center justify-center border-4 border-black bg-primary px-4 text-lg text-primary-foreground">
          {t("placeBid")}
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-4 text-center">
        <LockIcon aria-hidden="true" className="size-6" />
        <p id={`${props.id}-message`} className="text-sm font-medium">
          {props.message}
        </p>
        {props.actionHref && props.actionLabel ? (
          <a
            id={`${props.id}-action`}
            href={props.actionHref}
            className={buttonVariants({
              size: "sm",
              className: "no-underline",
            })}
          >
            {props.actionLabel}
          </a>
        ) : null}
      </div>
    </div>
  )
}
