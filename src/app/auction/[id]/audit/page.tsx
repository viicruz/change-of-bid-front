//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { LotAudit } from "@/src/components/audit/lot-audit"
import { Footer } from "@/src/components/footer/footer"

type AuditPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./auction/[id]/audit")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page(props: AuditPageProps) {
  const params = await props.params

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-[clamp(16px,4vw,48px)] pt-9 pb-20">
        <LotAudit id={params.id} />
      </main>
      <Footer />
    </>
  )
}
