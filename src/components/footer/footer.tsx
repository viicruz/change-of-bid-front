//* Libraries imports
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

//* Components imports
import { FooterAlerts } from "@/src/components/footer/footer-alerts"

const logoSize = 640

//* Social profiles don't exist yet: the icons point nowhere for now
const socialLinks = [
  {
    label: "Instagram",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" />
        <path d="M10 9l5 3-5 3z" />
      </>
    ),
  },
  {
    label: "WhatsApp",
    icon: <path d="M4 20l1.5-4.5A8 8 0 1 1 9 19z" />,
  },
]

function FooterHeading(props: { children: ReactNode }) {
  return (
    <h2 className="mt-0 mb-1.5 font-heading text-base font-normal text-brand-yellow">
      {props.children}
    </h2>
  )
}

function FooterLink(props: { href: string; children: ReactNode }) {
  return (
    <Link
      href={props.href}
      className="text-[#d9d4e0] no-underline hover:text-brand-yellow"
    >
      {props.children}
    </Link>
  )
}

export async function Footer() {
  const t = await getTranslations("components.footer")
  const tNavbar = await getTranslations("navbar")

  return (
    <footer
      aria-label={t("label")}
      className="border-t-8 border-brand-red bg-brand-ink text-[#d9d4e0]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-10 gap-y-12 px-[clamp(16px,4vw,48px)] pt-18 pb-10">
        <div className="flex flex-col gap-4.5">
          <Image
            src="/design/logo.png"
            alt="Change of Bid"
            width={logoSize}
            height={logoSize}
            sizes="140px"
            className="block size-35"
          />
          <p className="m-0 text-[15px] leading-[1.55]">{t("tagline")}</p>
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className="flex size-11 items-center justify-center border-3 border-brand-yellow text-brand-yellow transition-transform duration-[120ms] ease-out hover:-translate-x-[3px] hover:-translate-y-[3px] motion-reduce:transition-none"
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <nav aria-label={t("auctions")} className="flex flex-col gap-2.5">
          <FooterHeading>{t("auctions")}</FooterHeading>
          <FooterLink href="/#live">{tNavbar("sections.live")}</FooterLink>
          <FooterLink href="/#scheduled">
            {tNavbar("sections.scheduled")}
          </FooterLink>
          <FooterLink href="/#ended">{tNavbar("sections.ended")}</FooterLink>
          <FooterLink href="/sign-up">{t("sellCards")}</FooterLink>
        </nav>

        {/* Help pages don't exist yet: these links point nowhere for now */}
        <nav aria-label={t("help")} className="flex flex-col gap-2.5">
          <FooterHeading>{t("help")}</FooterHeading>
          <FooterLink href="#">{t("howItWorks")}</FooterLink>
          <FooterLink href="#">{t("faq")}</FooterLink>
          <FooterLink href="#">{t("shipping")}</FooterLink>
          <FooterLink href="#">{t("contact")}</FooterLink>
        </nav>

        <div className="flex flex-col gap-3">
          <FooterHeading>{t("alerts")}</FooterHeading>
          <p className="m-0 text-[15px] leading-normal">
            {t("alertsDescription")}
          </p>
          <FooterAlerts />
        </div>
      </div>

      <div className="border-t-3 border-[#2a2232]">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-[clamp(16px,4vw,48px)] py-5.5 text-[13px] text-[#a9a2b3]">
          <span>{t("rights", { year: String(new Date().getFullYear()) })}</span>
          <span>{t("konami")}</span>
        </div>
      </div>
    </footer>
  )
}
