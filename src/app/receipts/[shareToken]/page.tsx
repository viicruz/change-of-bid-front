//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
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
  const t = await getTranslations("pages./receipts/[shareToken]")

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-6">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        <h1
          id="receipt-page-title"
          className="font-heading text-3xl font-medium"
        >
          {t("title")}
        </h1>
        <Receipt shareToken={params.shareToken} />
      </div>
    </main>
  )
}
