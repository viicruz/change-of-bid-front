//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { BidHistory } from "@/src/components/bids/bid-history"
import { Footer } from "@/src/components/footer/footer"
import { Tag } from "@/src/components/ui/brand"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./my-bids")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page() {
  const t = await getTranslations("pages./my-bids")

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-[clamp(16px,4vw,48px)] pt-9 pb-22">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <Tag tone="red">{t("pageTag")}</Tag>
            <h1 className="font-heading text-[clamp(36px,5vw,64px)] leading-none font-normal">
              {t("title")}
            </h1>
            <p className="max-w-155 text-[17px] text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <BidHistory />
        </div>
      </main>
      <Footer />
    </>
  )
}
