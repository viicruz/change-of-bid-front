"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import { LotItemList } from "@/src/components/cards/lot-item-list"
import { lotSectionAnchors } from "@/src/components/home/lot-section"
import { LiveDot, Tag } from "@/src/components/ui/brand"

//* Hooks imports
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

const statusLabelKey = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  ENDED: "closed",
  CANCELED: "canceled",
} as const

const statusTagTone = {
  SCHEDULED: "yellow",
  LIVE: "red",
  ENDED: "dark",
  CANCELED: "inverse",
} as const

type PublicLot = ShowLot["lot"]
type PublicLotItem = PublicLot["items"][number]

export function LotBreadcrumb(props: { lot: PublicLot }) {
  const t = useTranslations("pages./auction/[id]")
  const status = props.lot.status

  return (
    <nav aria-label={t("breadcrumb.label")} className="mb-5">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm font-bold tracking-[0.5px] text-muted-foreground uppercase">
        <li>
          <Link href="/" className="text-muted-foreground no-underline">
            {t("breadcrumb.auctions")}
          </Link>
        </li>
        {/* Canceled lots have no section on the home page */}
        {status === "CANCELED" ? null : (
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link
              href={`/#${lotSectionAnchors[status]}`}
              className="text-muted-foreground no-underline"
            >
              {t(`statuses.${statusLabelKey[status]}`)}
            </Link>
          </li>
        )}
        <li className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="wrap-break-word text-foreground">
            {props.lot.title}
          </span>
        </li>
      </ol>
    </nav>
  )
}

export function LotHeading(props: { lot: PublicLot }) {
  const t = useTranslations("pages./auction/[id]")
  const lot = props.lot
  const totalCards = lot.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <Tag id="auction-room-status" tone={statusTagTone[lot.status]}>
          {lot.status === "LIVE" ? <LiveDot /> : null}
          {t(`statuses.${statusLabelKey[lot.status]}`)}
        </Tag>
        <Tag tone="dark">{t("cardCount", { count: totalCards })}</Tag>
      </div>
      <h1 id="auction-room-name" className="m-0 type-h1 wrap-break-word">
        {lot.title}
      </h1>
    </div>
  )
}

export function LotContents(props: { lot: PublicLot; items: PublicLotItem[] }) {
  const t = useTranslations("pages./auction/[id]")

  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 type-h2">{t("whatsIn")}</h2>
      {props.lot.description ? (
        <p
          id="lot-description"
          className="m-0 max-w-170 text-base leading-[1.55] whitespace-pre-line text-muted-foreground"
        >
          {props.lot.description}
        </p>
      ) : null}
      <LotItemList idPrefix="lot-item" items={props.items} />
    </div>
  )
}
