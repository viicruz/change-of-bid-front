//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

//* Components imports
import { LotAudit } from "@/src/components/audit/lot-audit"

//* Lib imports
import { censorBidderName } from "@/src/lib/audit/censor-bidder-name"
import {
  getLotAudit,
  type LotAudit as LotAuditData,
} from "@/src/lib/audit/mock-audit"

type AuditPageProps = {
  params: Promise<{ id: string }>
}

function toPublicAudit(audit: LotAuditData) {
  return {
    lot: audit.lot,
    items: audit.items,
    bids: audit.bids.map((bid) => {
      return {
        id: bid.id,
        amount: bid.amount,
        placedAt: bid.placedAt,
        bidderName: censorBidderName(bid.bidderName),
      }
    }),
  }
}

export async function generateMetadata(
  props: AuditPageProps
): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations("pages./auction/[id]/audit")
  const audit = getLotAudit(params.id)

  if (!audit) {
    return {
      title: t("title"),
      description: t("description"),
    }
  }

  return {
    title: `${t("title")} · ${audit.lot.name}`,
    description: t("description"),
  }
}

export default async function Page(props: AuditPageProps) {
  const params = await props.params
  const audit = getLotAudit(params.id)
  const t = await getTranslations("pages./auction/[id]/audit")

  if (!audit) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-6">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <h1 id="audit-title" className="font-heading text-3xl font-medium">
          {t("title")}
        </h1>
        <LotAudit audit={toPublicAudit(audit)} />
      </div>
    </main>
  )
}
