//* Components imports
import { Footer } from "@/src/components/footer/footer"
import { Hero } from "@/src/components/home/hero"
import { LotShowcase } from "@/src/components/home/lot-showcase"
import { Marquee } from "@/src/components/home/marquee"

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
