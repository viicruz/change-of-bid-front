"use client"

//* Libraries imports
import { TrophyIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

//* Components imports
import { LiveDot } from "@/src/components/ui/brand"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import type { IndexParticipation } from "@/src/hooks/participations/queries/use-index-participations"

//* Utils imports
import { cn } from "@/src/lib/utils"

const gridClassName =
  "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7"

type SummaryTileProps = {
  id: string
  label: ReactNode
  value: number
  hint: ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
  hintClassName?: string
}

function SummaryTile(props: SummaryTileProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 border-4 border-black p-5.5 shadow-hard-8",
        props.className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 text-sm font-bold tracking-[1px] uppercase",
          props.labelClassName
        )}
      >
        {props.label}
      </div>
      <div
        id={props.id}
        className={cn(
          "font-heading text-[clamp(34px,3.6vw,46px)] leading-[1.05] tabular-nums",
          props.valueClassName
        )}
      >
        {props.value}
      </div>
      <p className={cn("text-sm", props.hintClassName)}>{props.hint}</p>
    </div>
  )
}

type BidSummaryProps = {
  isPending: boolean
  participations: IndexParticipation[]
}

export function BidSummary(props: BidSummaryProps) {
  const t = useTranslations("pages./my-bids")

  if (props.isPending) {
    return (
      <div aria-hidden="true" className={gridClassName}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={`bid-summary-skeleton-${index}`}
            className="h-38 w-full rounded-none border-4 border-black/20"
          />
        ))}
      </div>
    )
  }

  if (props.participations.length === 0) {
    return null
  }

  const liveCount = props.participations.filter((participation) => {
    return participation.status === "LIVE"
  }).length
  const wonCount = props.participations.filter((participation) => {
    return participation.won
  }).length

  return (
    <section aria-label={t("summary.label")} className={gridClassName}>
      <SummaryTile
        id="bid-summary-live"
        className="border-border bg-card text-card-foreground shadow-brand-red"
        labelClassName="text-muted-foreground"
        hintClassName="text-muted-foreground"
        label={
          <>
            <LiveDot size={10} className="bg-brand-red" />
            {t("summary.live")}
          </>
        }
        value={liveCount}
        hint={t("summary.liveHint")}
      />
      <SummaryTile
        id="bid-summary-won"
        className="bg-brand-yellow text-brand-ink shadow-brand-red"
        hintClassName="font-semibold"
        label={
          <>
            <TrophyIcon
              aria-hidden="true"
              className="size-4"
              strokeWidth={3}
              strokeLinecap="square"
            />
            {t("summary.won")}
          </>
        }
        value={wonCount}
        hint={t("summary.wonHint")}
      />
      <SummaryTile
        id="bid-summary-total"
        className="bg-brand-ink text-white shadow-brand-yellow"
        labelClassName="text-[#D9D4E0]"
        valueClassName="text-brand-yellow"
        hintClassName="text-[#D9D4E0]"
        label={t("summary.total")}
        value={props.participations.length}
        hint={t("summary.totalHint")}
      />
    </section>
  )
}
