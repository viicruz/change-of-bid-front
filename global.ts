import type { formats } from "@/src/i18n/request"
import type { Locale } from "@/src/lib/locale"
import type messages from "./messages/en.json"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
    Formats: typeof formats
  }
}
