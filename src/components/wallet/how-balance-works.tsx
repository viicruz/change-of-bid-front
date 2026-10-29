"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Utils imports
import { cn } from "@/src/lib/utils"

//* One color per step: the money starts dark, gets locked (yellow) and leaves (red)
const steps = [
  { key: "bid", tone: "bg-brand-ink text-brand-yellow" },
  { key: "outbid", tone: "bg-brand-yellow text-brand-ink" },
  { key: "win", tone: "bg-brand-red text-white" },
] as const

export function HowBalanceWorks() {
  const t = useTranslations("pages./wallet")

  return (
    <section
      className="flex flex-col gap-[18px]"
      aria-labelledby="wallet-how-title"
    >
      <h2 id="wallet-how-title" className="type-h2">
        {t("how.title")}
      </h2>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
        {steps.map((step, index) => (
          <li
            key={step.key}
            className="flex items-start gap-3.5 border-3 border-input bg-card p-3.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-10 flex-none items-center justify-center border-3 border-black font-heading text-lg",
                step.tone
              )}
            >
              {index + 1}
            </span>
            <div>
              <h3 className="font-heading text-base font-normal">
                {t(`how.${step.key}.title`)}
              </h3>
              <p className="mt-1 text-sm leading-[1.45] text-muted-foreground">
                {t(`how.${step.key}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
