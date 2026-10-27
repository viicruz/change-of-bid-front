"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { LotCard } from "@/src/components/home/lot-card"
import { Skeleton } from "@/src/components/ui/skeleton"

//* Hooks imports
import { useIndexLots } from "@/src/hooks/lots/queries/use-index-lots"

//* Schema imports
import type { PublicLotStatus } from "@/src/schemas/lot"

const loadingSkeletonCount = 3

export function LotSection(props: { status: PublicLotStatus; query: string }) {
  const t = useTranslations("pages./")
  const lotsQuery = useIndexLots({
    q: props.query,
    status: props.status,
  })
  const lots = lotsQuery.data?.lots ?? []

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby={`lot-section-${props.status}`}
    >
      <h2
        id={`lot-section-${props.status}`}
        className="font-heading text-lg font-medium"
      >
        {t(`sections.${props.status}`)}
      </h2>
      {lotsQuery.isError ? (
        <p id={`lot-section-${props.status}-error`}>{t("error")}</p>
      ) : lotsQuery.isPending ? (
        <>
          <p className="sr-only">{t("loading")}</p>
          <ul
            aria-labelledby={`lot-section-${props.status}`}
            aria-busy="true"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {Array.from({ length: loadingSkeletonCount }, (_, index) => (
              <li key={`${props.status}-skeleton-${index}`}>
                <Skeleton className="aspect-59/86 w-full" />
              </li>
            ))}
          </ul>
        </>
      ) : lots.length === 0 ? (
        <p id={`lot-section-${props.status}-empty`}>{t("empty")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {lots.map((lot) => (
            <li key={lot.id} className="relative aspect-59/86 w-full">
              <LotCard lot={lot} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
