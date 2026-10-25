//* Libraries imports
import { getTranslations } from "next-intl/server"
import Link from "next/link"

//* Components imports
import { SignUpForm } from "./sign-up-form"

export default async function Page() {
  const t = await getTranslations("pages./sign-up")

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6 border border-border bg-card p-6 text-card-foreground">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-medium">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <SignUpForm />
        <Link
          id="sign-up-sign-in-link"
          href="/sign-in"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          {t("signInLink")}
        </Link>
      </div>
    </main>
  )
}
