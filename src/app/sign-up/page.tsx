//* Libraries imports
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"

//* Components imports
import { HighlightWord, Tag } from "@/src/components/ui/brand"
import { SignUpForm } from "./sign-up-form"

//* Lib imports
import { cn } from "@/src/lib/utils"

const cardWidth = 813
const cardHeight = 1185
const logoSize = 640

//* Fanned hand at the bottom of the brand panel
const fannedCards = [
  {
    src: "/design/dark-magic-expanded.jpg",
    className: "bottom-0 left-0 -rotate-14 shadow-brand-red",
  },
  {
    src: "/design/labrynth-cooclock.jpg",
    className: "bottom-5 left-[110px] -rotate-2 shadow-brand-yellow",
  },
  {
    src: "/design/parallel-teleport.jpg",
    className: "bottom-0 left-[220px] rotate-12 shadow-brand-red",
  },
]

export default async function Page() {
  const t = await getTranslations("pages./sign-up")

  return (
    <div className="flex flex-1 flex-wrap overflow-x-hidden">
      {/* Brand panel: always dark, like the stage */}
      <aside className="relative flex min-w-0 flex-[1_1_440px] flex-col gap-8 overflow-hidden border-r-6 border-brand-red bg-brand-ink bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.08)_0_2px,transparent_2px_24px)] p-[clamp(28px,4vw,56px)] text-white">
        <Image
          src="/design/logo.png"
          alt={t("brand.logoAlt")}
          width={logoSize}
          height={logoSize}
          sizes="(min-width: 1334px) 240px, 160px"
          preload
          className="block h-auto w-[clamp(160px,18vw,240px)]"
        />
        <div className="flex max-w-120 flex-col gap-4.5">
          <Tag tone="yellow" className="text-sm">
            {t("brand.tag")}
          </Tag>
          <h1 className="m-0 font-heading text-[clamp(40px,4.6vw,68px)] leading-[0.98] font-normal">
            {t("brand.titleA")}{" "}
            <HighlightWord className="px-3">{t("brand.titleB")}</HighlightWord>
          </h1>
          <p className="m-0 text-lg leading-normal text-[#d9d4e0]">
            {t("brand.description")}
          </p>
        </div>
        <div aria-hidden="true" className="relative mt-auto h-60 shrink-0">
          {fannedCards.map((card) => (
            <Image
              key={card.src}
              src={card.src}
              alt=""
              width={cardWidth}
              height={cardHeight}
              sizes="130px"
              className={cn(
                "absolute block w-32.5 border-4 border-black shadow-hard-6",
                card.className
              )}
            />
          ))}
        </div>
      </aside>

      <main className="flex min-w-0 flex-[999_1_560px] items-center justify-center px-[clamp(16px,4vw,56px)] py-[clamp(28px,5vw,72px)]">
        <div className="flex w-full max-w-140 flex-col gap-5.5 border-4 border-border bg-card p-[clamp(24px,4vw,44px)] text-card-foreground shadow-hard-12 shadow-brand-red">
          <div className="flex flex-col gap-1.5">
            <h2 className="m-0 font-heading text-[clamp(28px,3vw,38px)] leading-[1.05] font-normal">
              {t("title")}
            </h2>
            <p className="m-0 text-base text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link
                id="sign-up-sign-in-link"
                href="/sign-in"
                className="font-bold text-red-text underline hover:text-foreground"
              >
                {t("signInLink")}
              </Link>
            </p>
          </div>
          <SignUpForm />
        </div>
      </main>
    </div>
  )
}
