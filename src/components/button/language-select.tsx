"use client"

//* Libraries imports
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { ChangeEvent } from "react"

//* Components imports
import { Label } from "@/src/components/ui/label"

//* Locale imports
import { localeCookieName, locales, type Locale } from "@/src/lib/locale"

const cookieMaxAge = 60 * 60 * 24 * 365

function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

export function LanguageSelect() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations("localeSelect")
  const localeLabels: Record<Locale, string> = {
    en: t("locales.en"),
    "pt-br": t("locales.pt-br"),
  }

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.currentTarget.value

    if (!isLocale(value) || value === locale) {
      return
    }

    document.cookie = `${localeCookieName}=${value}; max-age=${cookieMaxAge}; path=/; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="language-select">{t("label")}</Label>
      <select
        id="language-select"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={locale}
        onChange={onChange}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </div>
  )
}
