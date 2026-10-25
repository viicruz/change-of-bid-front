"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { LotCard } from "@/src/components/home/lot-card"

//* Lib imports
import type { Lot, LotStatus } from "@/src/lib/lots/mock-lots"

export function LotSection(props: { status: LotStatus; lots: Lot[] }) {
  const t = useTranslations("pages./")

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
      {props.lots.length === 0 ? (
        <p>{t("empty")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {props.lots.map((lot) => (
            <li key={lot.id} className="relative aspect-59/86 w-full">
              <LotCard lot={lot} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
