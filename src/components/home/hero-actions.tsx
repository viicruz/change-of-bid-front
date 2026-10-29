"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import Link from "next/link"

//* Components imports
import { ArrowRightIcon } from "@/src/components/ui/brand"
import { buttonVariants } from "@/src/components/ui/button"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"

export function HeroActions() {
  const t = useTranslations("pages./.hero")
  const session = useAuthSession()
  const guest = !session.isPending && session.data == null

  return (
    <div className="flex flex-wrap gap-4">
      <Link
        id="hero-live-link"
        href="#live"
        className={buttonVariants({ size: "lg", className: "text-xl" })}
      >
        {t("ctaLive")}
        <ArrowRightIcon />
      </Link>
      {guest ? (
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
      ) : null}
    </div>
  )
}
