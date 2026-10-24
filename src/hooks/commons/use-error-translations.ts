"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

type ErrorCatalog = {
  (key: string): string
  has: (key: string) => boolean
}

export function useErrorTranslations() {
  const schemas = useTranslations("schemas")
  const exceptions = useTranslations("exceptions")
  const schemaMessages = schemas as unknown as ErrorCatalog
  const exceptionMessages = exceptions as unknown as ErrorCatalog

  return function translateError(code: string) {
    if (schemaMessages.has(code)) {
      return schemaMessages(code)
    }

    if (exceptionMessages.has(code)) {
      return exceptionMessages(code)
    }

    return schemas("00000_UNKNOWN_ERROR")
  }
}
