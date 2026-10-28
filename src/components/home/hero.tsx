//* Libraries imports
import { getFormatter, getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"

//* Components imports
import {
  ArrowRightIcon,
  HighlightWord,
  LiveDot,
  Tag,
} from "@/src/components/ui/brand"
import { buttonVariants } from "@/src/components/ui/button"

//* Lib imports
import { cn } from "@/src/lib/utils"

const cardWidth = 813
const cardHeight = 1185
const logoSize = 640
const stickerAmount = 10

const steps = [
  { key: "pick", className: "bg-brand-yellow text-brand-ink" },
  { key: "bid", className: "bg-brand-yellow text-brand-ink" },
  { key: "win", className: "bg-brand-red text-white" },
] as const

export async function Hero() {
  const t = await getTranslations("pages./.hero")
  const format = await getFormatter()

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="bg-background bg-[repeating-linear-gradient(-45deg,var(--hatch)_0_2px,transparent_2px_24px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(72px,8vw,120px)]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-14 px-[clamp(16px,4vw,48px)]">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-7">
          <Tag tone="yellow" className="text-sm">
            {t("tag")}
          </Tag>
          <h1
            id="hero-title"
            className="m-0 font-heading text-[clamp(44px,6.4vw,92px)] leading-[0.98] font-normal tracking-[-1px]"
          >
            {t("titleA")} <HighlightWord>{t("titleB")}</HighlightWord>
            <br />
            {t("titleC")}{" "}
            <span className="text-brand-yellow [paint-order:stroke_fill] [-webkit-text-stroke:3px_var(--brand-ink)]">
              {t("titleD")}
            </span>
          </h1>
          <p className="m-0 max-w-140 text-[clamp(17px,1.6vw,20px)] leading-normal text-muted-foreground">
            {t("description")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              id="hero-live-link"
              href="#live"
              className={buttonVariants({ size: "lg", className: "text-xl" })}
            >
              {t("ctaLive")}
              <ArrowRightIcon />
            </Link>
            <Link
              id="hero-sign-up-link"
              href="/sign-up"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "text-xl",
              })}
            >
              {t("ctaSignUp")}
            </Link>
          </div>
          <ol
            aria-label={t("stepsLabel")}
            className="mt-2 flex list-none flex-wrap gap-x-7 gap-y-3 p-0 text-[15px] font-bold uppercase"
          >
            {steps.map((step, index) => (
              <li key={step.key} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-8 items-center justify-center border-2 border-black font-heading",
                    step.className
                  )}
                >
                  {index + 1}
                </span>
                {t(`steps.${step.key}`)}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] justify-center">
          <div className="relative aspect-square w-full max-w-140">
            <Image
              src="/design/magnum-the-reliever.jpg"
              alt={t("cardAlt", { name: "Magnum the Reliever" })}
              width={cardWidth}
              height={cardHeight}
              sizes="(min-width: 1024px) 200px, 36vw"
              className="absolute top-[20%] left-[-2%] block w-[36%] -rotate-16 border-4 border-black shadow-[8px_8px_0_var(--brand-red)]"
            />
            <Image
              src="/design/cyberse-code-magician.jpg"
              alt={t("cardAlt", { name: "Cyberse Code Magician" })}
              width={cardWidth}
              height={cardHeight}
              sizes="(min-width: 1024px) 200px, 36vw"
              className="absolute top-[14%] right-[-2%] block w-[36%] rotate-13 border-4 border-black shadow-[-8px_8px_0_var(--brand-yellow)]"
            />
            <Image
              src="/design/logo.png"
              alt={t("logoAlt")}
              width={logoSize}
              height={logoSize}
              sizes="(min-width: 1024px) 480px, 86vw"
              preload
              className="absolute top-[4%] left-[7%] block w-[86%] drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
            />
            <div className="absolute bottom-[2%] left-0 -rotate-6 border-4 border-black bg-brand-yellow px-4 py-2.5 text-brand-ink shadow-[6px_6px_0_#000]">
              <div className="text-xs font-bold tracking-[1px] uppercase">
                {t("stickerLabel")}
              </div>
              <div className="font-heading text-[22px] leading-[1.1]">
                +{" "}
                {format.number(stickerAmount, {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
            <div className="absolute right-[2%] bottom-[8%] flex rotate-5 items-center gap-2 border-4 border-black bg-brand-red px-3.5 py-2 font-heading text-lg text-white">
              <LiveDot size={10} />
              {t("liveBadge")}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
