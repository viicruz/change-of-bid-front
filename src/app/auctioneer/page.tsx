//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { AuctioneerPanel } from "@/src/components/auctioneer/auctioneer-panel"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./auctioneer")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page() {
  const t = await getTranslations("pages./auctioneer")

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-6">
      <div className="flex w-full max-w-7xl flex-col gap-6">
        <h1 id="auctioneer-title" className="font-heading text-3xl font-medium">
          {t("title")}
        </h1>
        <AuctioneerPanel />
      </div>
    </main>
  )
}
