//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

//* Components imports
import { AuctionRoom } from "@/src/components/auction/auction-room"

//* Lib imports
import { getLotAudit } from "@/src/lib/audit/mock-audit"

type AuctionPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  props: AuctionPageProps
): Promise<Metadata> {
  const params = await props.params
  const t = await getTranslations("pages./auction/[id]")
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

export default async function Page(props: AuctionPageProps) {
  const params = await props.params
  const audit = getLotAudit(params.id)
  const t = await getTranslations("pages./auction/[id]")

  if (!audit) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-6">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <h1
          id="auction-room-title"
          className="font-heading text-3xl font-medium"
        >
          {t("title")}
        </h1>
        <AuctionRoom audit={audit} />
      </div>
    </main>
  )
}
