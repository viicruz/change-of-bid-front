"use client"

//* Libraries imports
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

type FormErrorProps = {
  code?: string | null
  id?: string
  className?: string
  fallback?: string
}

/** Renders a translated form error code as an accessible alert. */
export function FormError({
  code,
  id,
  className = "text-sm text-destructive",
  fallback,
}: FormErrorProps) {
  const translateError = useErrorTranslations()

  if (!code) return null

  return (
    <p id={id} role="alert" className={className}>
      {fallback && code === "00000_UNKNOWN_ERROR"
        ? fallback
        : translateError(code)}
    </p>
  )
}
