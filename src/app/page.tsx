//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { Footer } from "@/src/components/footer/footer"
import { Hero } from "@/src/components/home/hero"
import { LotShowcase } from "@/src/components/home/lot-showcase"
import { Marquee } from "@/src/components/home/marquee"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function Page() {
  return (
    <>
      {/* Clips the tilted marquee, which is wider than the page */}
      <main className="flex flex-1 flex-col overflow-x-clip">
        <Hero />
        <Marquee />
        <LotShowcase />
      </main>
      <Footer />
    </>
  )
}
