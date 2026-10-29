//* Libraries imports
import { getTranslations } from "next-intl/server"
import Link from "next/link"

//* Components imports
import { AuthBrandPanel } from "@/src/components/auth/auth-brand-panel"
import { buttonVariants } from "@/src/components/ui/button"
import { SignInForm } from "./sign-in-form"

//* Lib imports
import { cn } from "@/src/lib/utils"

//* Fanned hand at the bottom of the brand panel
const fannedCards = [
  {
    src: "/design/magnum-the-reliever.jpg",
    className: "bottom-0 left-0 -rotate-12 shadow-brand-yellow",
  },
  {
    src: "/design/cyberse-code-magician.jpg",
    className: "bottom-5.5 left-[110px] rotate-3 shadow-brand-red",
  },
  {
    src: "/design/performapal-sky-pupil.jpg",
    className: "bottom-0 left-[220px] rotate-14 shadow-brand-yellow",
  },
]

export default async function Page() {
  const t = await getTranslations("pages./sign-in")

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
        <div className="flex w-full max-w-125 flex-col gap-5.5 border-4 border-border bg-card p-[clamp(24px,4vw,44px)] text-card-foreground shadow-hard-12 shadow-brand-red">
          <div className="flex flex-col gap-1.5">
            <h2 className="m-0 font-heading text-[clamp(28px,3vw,38px)] leading-[1.05] font-normal">
              {t("title")}
            </h2>
            <p className="m-0 text-base text-muted-foreground">
              {t("noAccount")}{" "}
              <Link
                id="sign-in-sign-up-link"
                href="/sign-up"
                className="font-bold text-red-text underline hover:text-foreground"
              >
                {t("signUpLink")}
              </Link>
            </p>
          </div>
          <SignInForm />
          <div
            aria-hidden="true"
            className="flex items-center gap-3 font-heading text-[13px] text-muted-foreground"
          >
            <span className="h-0.75 flex-1 bg-line-soft" />
            {t("or")}
            <span className="h-0.75 flex-1 bg-line-soft" />
          </div>
          <Link
            id="sign-in-create-account"
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto w-full border-3 p-3.5 text-base whitespace-normal text-foreground"
            )}
          >
            {t("createAccount")}
          </Link>
        </div>
      </main>
    </div>
  )
}
