export const locales = ["en", "pt-br"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "pt-br"

export const localeCookieName = "NEXT_LOCALE"
