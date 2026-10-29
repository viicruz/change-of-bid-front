"use client"

//* Libraries imports
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

//* Locale imports
import { localeCookieName, type Locale } from "@/src/lib/locale"

//* Lib imports
import { cn } from "@/src/lib/utils"

const cookieMaxAge = 60 * 60 * 24 * 365

//* PT first, like the reference design
const localeOrder: Locale[] = ["pt-br", "en"]

function saveLocale(value: Locale) {
  document.cookie = `${localeCookieName}=${value}; max-age=${cookieMaxAge}; path=/; SameSite=Lax`
}

export function LanguageSelect(props: { id: string }) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations("localeSelect")

  function onPick(value: Locale) {
    if (value === locale) {
      return
    }

    saveLocale(value)
    router.refresh()
  }

  return (
    <div
      id={props.id}
      role="group"
      aria-label={t("label")}
      className="flex h-11 border-3 border-black"
    >
      {localeOrder.map((code) => {
        const pressed = code === locale

        return (
          <button
            key={code}
            id={`${props.id}-${code}`}
            type="button"
            lang={code}
            aria-pressed={pressed}
            aria-label={t(`locales.${code}`)}
            onClick={() => onPick(code)}
            className={cn(
              "h-9.5 min-w-11 rounded-none px-2.5 font-heading text-[13px] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring",
              pressed ? "bg-brand-red text-white" : "bg-header text-foreground"
            )}
          >
            {t(`short.${code}`)}
          </button>
        )
      })}
    </div>
  )
}
