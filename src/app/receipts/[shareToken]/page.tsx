//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { Footer } from "@/src/components/footer/footer"
import { Receipt } from "@/src/components/receipts/receipt"

type ReceiptPageProps = {
  params: Promise<{ shareToken: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./receipts/[shareToken]")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page(props: ReceiptPageProps) {
  const params = await props.params

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-[clamp(16px,4vw,48px)] pt-9 pb-20 print:p-0">
        <Receipt shareToken={params.shareToken} />
      </main>
      <Footer />
    </>
  )
}
