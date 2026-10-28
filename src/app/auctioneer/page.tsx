//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { AuctioneerPanel } from "@/src/components/auctioneer/auctioneer-panel"
import { Footer } from "@/src/components/footer/footer"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./auctioneer")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function Page() {
  return (
    <>
      <main className="mx-auto w-full max-w-360 flex-1 px-[clamp(16px,3vw,40px)] pt-7 pb-16">
        <AuctioneerPanel />
      </main>
      <Footer />
    </>
  )
}
