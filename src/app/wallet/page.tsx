//* Libraries imports
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

//* Components imports
import { Footer } from "@/src/components/footer/footer"
import { WalletSummary } from "@/src/components/wallet/wallet-summary"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./wallet")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function Page() {
  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-[clamp(16px,4vw,48px)] pt-9 pb-22">
        <WalletSummary />
      </main>
      <Footer />
    </>
  )
}
