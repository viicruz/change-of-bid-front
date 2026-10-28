"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

//* Components imports
import { LotCard } from "@/src/components/home/lot-card"
import { LiveDot, SectionHeading, Tag } from "@/src/components/ui/brand"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import { useIndexLots } from "@/src/hooks/lots/queries/use-index-lots"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

//* Lib imports
import { cn } from "@/src/lib/utils"

const loadingSkeletonCount = 4

//* Anchors used by the navbar and the hero CTA
export const lotSectionAnchors = {
  LIVE: "live",
  SCHEDULED: "scheduled",
  ENDED: "ended",
} as const satisfies Record<PublicLotStatus, string>

const sectionStyles = {
  LIVE: {
    section: "bg-bg-alt",
    tag: "red",
    title: undefined,
    description: undefined,
    message: "text-muted-foreground",
  },
  //* Yellow in both themes, so its text stays dark
  SCHEDULED: {
    section:
      "border-y-4 border-black bg-brand-yellow bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.05)_0_2px,transparent_2px_22px)] text-brand-ink",
    tag: "dark",
    title: "text-brand-ink",
    description: "text-[#2a2230]",
    message: "text-brand-ink",
  },
  ENDED: {
    section: "bg-background",
    tag: "inverse",
    title: undefined,
    description: undefined,
    message: "text-muted-foreground",
  },
} as const

const gridClassName =
  "grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-8 gap-y-9"

export function LotSection(props: {
  status: PublicLotStatus
  query: string
  children?: ReactNode
}) {
  const t = useTranslations("pages./")
  const lotsQuery = useIndexLots({
    q: props.query,
    status: props.status,
  })
  const lots = lotsQuery.data?.lots ?? []
  const styles = sectionStyles[props.status]
  const headingId = `lot-section-${props.status}`

  return (
    <section
      id={lotSectionAnchors[props.status]}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-20 py-[clamp(72px,8vw,112px)]",
        styles.section
      )}
    >
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <SectionHeading
          id={headingId}
          tag={
            <Tag tone={styles.tag} className="text-sm">
              {props.status === "LIVE" ? <LiveDot size={9} /> : null}
              {t(`sections.${props.status}.tag`)}
            </Tag>
          }
          title={
            <span className={styles.title}>
              {t(`sections.${props.status}.title`)}
            </span>
          }
          description={t(`sections.${props.status}.description`)}
          descriptionClassName={styles.description}
        >
          {props.children}
        </SectionHeading>
        {lotsQuery.isError ? (
          <p
            id={`lot-section-${props.status}-error`}
            className={cn("text-lg font-semibold", styles.message)}
          >
            {t("error")}
          </p>
        ) : lotsQuery.isPending ? (
          <>
            <p className="sr-only">{t("loading")}</p>
            <ul
              aria-labelledby={headingId}
              aria-busy="true"
              className={gridClassName}
            >
              {Array.from({ length: loadingSkeletonCount }, (_, index) => (
                <li key={`${props.status}-skeleton-${index}`}>
                  <Skeleton className="aspect-3/5 w-full rounded-none border-4 border-black/20" />
                </li>
              ))}
            </ul>
          </>
        ) : lots.length === 0 ? (
          <p
            id={`lot-section-${props.status}-empty`}
            className={cn("text-lg font-semibold", styles.message)}
          >
            {t("empty")}
          </p>
        ) : (
          <ul aria-labelledby={headingId} className={gridClassName}>
            {lots.map((lot) => (
              <li key={lot.id}>
                <LotCard lot={lot} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
