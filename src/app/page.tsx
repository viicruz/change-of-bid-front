//* Libraries imports
import { getTranslations } from "next-intl/server"

//* Components imports
import { LotShowcase } from "@/src/components/home/lot-showcase"
import { ShowcaseCta } from "@/src/components/home/showcase-cta"

export default async function Page() {
  const t = await getTranslations("pages./")

  return (
    <main className="flex flex-1 flex-col items-center gap-6 py-6">
      <div className="w-full max-w-7xl">
        <ShowcaseCta />
      </div>
      <div className="flex w-full max-w-3xl flex-col px-6">
        <LotShowcase />
      </div>
    </main>
  )
}
