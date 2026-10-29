//* Libraries imports
import { SkullIcon } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"

//* Components imports
import { Footer } from "@/src/components/footer/footer"
import { ArrowRightIcon, HighlightWord, Tag } from "@/src/components/ui/brand"
import { buttonVariants } from "@/src/components/ui/button"

const logoSize = 640

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./not-found")

  return {
    title: t("title"),
    description: t("description"),
  }
}

//* 4-0-4 as a fanned hand: the zero is a face-down card with the logo
function LostHand() {
  return (
    <div
      aria-hidden="true"
      className="@container relative aspect-[5/4] w-full max-w-140 select-none"
    >
      <div className="absolute top-[16%] left-[1%] flex aspect-[813/1185] w-[34%] -rotate-12 items-center justify-center border-4 border-black bg-brand-red font-heading text-[26cqw] leading-none text-brand-yellow shadow-[8px_8px_0_var(--brand-yellow)] [-webkit-text-stroke:4px_var(--brand-ink)] [paint-order:stroke_fill]">
        4
      </div>
      <div className="absolute top-[16%] right-[1%] flex aspect-[813/1185] w-[34%] rotate-12 items-center justify-center border-4 border-black bg-brand-yellow font-heading text-[26cqw] leading-none text-brand-red shadow-[-8px_8px_0_var(--brand-red)] [-webkit-text-stroke:4px_var(--brand-ink)] [paint-order:stroke_fill]">
        4
      </div>
      <div className="absolute top-[3%] left-[31%] flex aspect-[813/1185] w-[38%] rotate-2 animate-pop items-center justify-center border-4 border-black bg-brand-ink bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.16)_0_2px,transparent_2px_14px)] shadow-hard-8 shadow-brand-red">
        <div className="absolute inset-[6%] border-3 border-brand-yellow" />
        <Image
          src="/design/logo.png"
          alt=""
          width={logoSize}
          height={logoSize}
          sizes="(min-width: 1024px) 200px, 34vw"
          preload
          className="relative block w-[88%]"
        />
      </div>
    </div>
  )
}

export default async function NotFound() {
  const t = await getTranslations("pages./not-found")

  return (
    <>
      <main className="flex flex-1 flex-col overflow-x-clip bg-background bg-[repeating-linear-gradient(-45deg,var(--hatch)_0_2px,transparent_2px_24px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(72px,8vw,120px)]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-14 px-[clamp(16px,4vw,48px)]">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-7">
            <Tag tone="red" className="text-sm">
              {t("tag")}
            </Tag>
            <h1 className="m-0 font-heading text-[clamp(40px,5.6vw,84px)] leading-[0.98] font-normal tracking-[-1px]">
              {t("titleA")} <HighlightWord>{t("titleB")}</HighlightWord>
              <br />
              {t("titleC")}
            </h1>
            <p className="m-0 max-w-140 text-[clamp(17px,1.6vw,20px)] leading-normal text-muted-foreground">
              {t("subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                id="not-found-live-link"
                href="/#live"
                className={buttonVariants({ size: "lg", className: "text-xl" })}
              >
                {t("ctaLive")}
                <ArrowRightIcon />
              </Link>
              <Link
                id="not-found-home-link"
                href="/"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "text-xl",
                })}
              >
                {t("ctaHome")}
              </Link>
            </div>
          </div>

          <div className="relative flex min-w-0 flex-[1_1_420px] justify-center">
            <LostHand />
            <div className="absolute bottom-[2%] left-1/2 flex -translate-x-1/2 -rotate-4 items-center gap-2 border-4 border-black bg-brand-ink px-3.5 py-2 font-heading text-lg whitespace-nowrap text-brand-yellow shadow-hard-6 shadow-brand-red">
              <SkullIcon aria-hidden="true" className="size-5" />
              {t("graveyardBadge")}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
