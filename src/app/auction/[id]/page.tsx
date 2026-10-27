//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

//* Components imports
import { AuctionRoom } from "@/src/components/auction/auction-room"

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
  const t = await getTranslations("pages./auction/[id]")

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-6">
      <div className="flex w-full max-w-6xl flex-col gap-6">
        <h1
          id="auction-room-title"
          className="font-heading text-3xl font-medium"
        >
          {t("title")}
        </h1>
        <AuctionRoom id={params.id} />
      </div>
    </main>
  )
}
