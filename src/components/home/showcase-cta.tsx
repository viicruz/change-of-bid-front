"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import { buttonVariants } from "@/src/components/ui/button"

export function ShowcaseCta() {
  const t = useTranslations("pages./")

  return (
    <div className="min-h-96 w-full justify-center rounded-none bg-blue-600 px-4 flex flex-col gap-4 items-start">
      <div>
        <h1 className="font-heading text-xl font-medium">{t("ctaTitle")}</h1>
        <div>{t("ctaDescription")}</div>
      </div>
      <div>
        <Link id="showcase-cta" href="/sign-up" className={buttonVariants()}>
          {t("ctaButton")}
        </Link>
      </div>
    </div>
  )
}
