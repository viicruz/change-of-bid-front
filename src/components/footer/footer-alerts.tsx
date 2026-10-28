"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useState, type FormEvent } from "react"

export function FooterAlerts() {
  const t = useTranslations("components.footer")
  //* No lot alerts API yet: submitting only says it is coming
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={onSubmit}>
      <label
        htmlFor="footer-email"
        className="text-[13px] font-bold tracking-[1px] text-white uppercase"
      >
        {t("email")}
      </label>
      <div className="flex">
        <input
          id="footer-email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className="min-h-12 min-w-0 flex-1 rounded-none border-3 border-r-0 border-brand-yellow bg-[#1e1828] p-3 text-[15px] text-white [color-scheme:dark] outline-none placeholder:text-white/60 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-yellow"
        />
        <button
          id="footer-subscribe"
          type="submit"
          className="rounded-none border-3 border-brand-yellow bg-brand-yellow px-4 font-heading text-sm text-brand-ink transition-transform duration-[120ms] ease-out hover:-translate-x-[3px] hover:-translate-y-[3px] active:translate-x-[2px] active:translate-y-[2px] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-yellow motion-reduce:transition-none"
        >
          {t("subscribe")}
        </button>
      </div>
      <p role="status" className="m-0 text-sm text-brand-yellow empty:hidden">
        {submitted ? t("alertsSoon") : null}
      </p>
    </form>
  )
}
