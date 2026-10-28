"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

//* Hooks imports
import { useIsClient } from "@/src/hooks/use-is-client"

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
    >
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  )
}

export function ThemeToggle(props: { id: string }) {
  const t = useTranslations("navbar.theme")
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()
  //* Dark is the brand default until the client knows the real theme
  const dark = !isClient || resolvedTheme !== "light"
  const label = dark ? t("toLight") : t("toDark")

  return (
    <button
      id={props.id}
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="flex size-11 items-center justify-center rounded-none border-3 border-black bg-brand-ink text-brand-yellow transition-transform duration-[120ms] ease-out hover:-translate-x-[3px] hover:-translate-y-[3px] active:translate-x-[2px] active:translate-y-[2px] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring motion-reduce:transition-none dark:bg-brand-yellow dark:text-brand-ink"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
