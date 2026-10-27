//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { WalletSummary } from "@/src/components/wallet/wallet-summary"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./wallet")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page() {
  const t = await getTranslations("pages./wallet")

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-6">
      <div className="flex w-full max-w-3xl flex-col items-center gap-6">
        <h1 className="font-heading text-3xl font-medium">{t("title")}</h1>
        <WalletSummary />
      </div>
    </main>
  )
}
