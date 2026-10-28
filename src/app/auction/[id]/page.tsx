//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { AuctionRoom } from "@/src/components/auction/auction-room"
import { Footer } from "@/src/components/footer/footer"

type AuctionPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./auction/[id]")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page(props: AuctionPageProps) {
  const params = await props.params

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-[clamp(16px,4vw,48px)] pt-7 pb-20">
        <AuctionRoom id={params.id} />
      </main>
      <Footer />
    </>
  )
}
