//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"

//* Message imports
import enMessages from "@/messages/en.json"
import ptBrMessages from "@/messages/pt-br.json"

//* Locale imports
import { defaultLocale, type Locale } from "@/src/lib/locale"

const messagesByLocale = {
  en: enMessages,
  "pt-br": ptBrMessages,
} as const

export function ComponentProviders(props: {
  children: ReactNode
  locale?: Locale
}) {
  const locale = props.locale ?? defaultLocale

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messagesByLocale[locale] as typeof enMessages}
    >
      {props.children}
    </NextIntlClientProvider>
  )
}
