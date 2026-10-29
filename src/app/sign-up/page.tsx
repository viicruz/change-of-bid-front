//* Libraries imports
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import Link from "next/link"

//* Components imports
import { AuthBrandPanel } from "@/src/components/auth/auth-brand-panel"
import { SignUpForm } from "./sign-up-form"

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./sign-up")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function Page() {
  const t = await getTranslations("pages./sign-up")

  return (
    <div className="flex flex-1 flex-wrap overflow-x-hidden">
      <AuthBrandPanel
        logoAlt={t("brand.logoAlt")}
        tag={t("brand.tag")}
        titleA={t("brand.titleA")}
        titleB={t("brand.titleB")}
        description={t("brand.description")}
        cards={fannedCards}
      />

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
