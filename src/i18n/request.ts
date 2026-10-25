//* Libraries imports
import { cookies, headers } from "next/headers"
import type { Formats } from "next-intl"
import { getRequestConfig } from "next-intl/server"

//* Locale imports
import {
  defaultLocale,
  localeCookieName,
  locales,
  type Locale,
} from "@/src/lib/locale"

export const formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "2-digit",
      year: "2-digit",
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 2,
    },
  },
} as const satisfies Formats

function toLocale(value: string | null | undefined): Locale | undefined {
  if (!value) {
    return undefined
  }

  const token = value.split(",")[0]?.trim().toLowerCase()

  if (!token) {
    return undefined
  }

  for (const locale of locales) {
    if (locale === token) {
      return locale
    }
  }

  return undefined
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const locale =
    toLocale(cookieStore.get(localeCookieName)?.value) ??
    toLocale(headerStore.get("accept-language")) ??
    defaultLocale

  return {
    locale,
    formats,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
