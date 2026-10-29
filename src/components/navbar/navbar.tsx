"use client"

//* Libraries imports
import {
  CalendarClockIcon,
  GavelIcon,
  HouseIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  RadioIcon,
  SkullIcon,
  UserPlusIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

//* Components imports
import { LanguageSelect } from "@/src/components/button/language-select"
import { ThemeToggle } from "@/src/components/button/theme-toggle"
import { lotSectionAnchors } from "@/src/components/home/lot-section"
import { LiveDot, Wordmark } from "@/src/components/ui/brand"
import { Button, buttonVariants } from "@/src/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"
import { useSignOut } from "@/src/hooks/auth/use-sign-out"

//* Schema imports
import { userRoleSchema, type UserRole } from "@/src/schemas/user"

//* Lib imports
import { cn } from "@/src/lib/utils"

type NavbarLinkLabel =
  | "links.home"
  | "links.myBids"
  | "links.wallet"
  | "links.auctioneer"
  | "links.signIn"
  | "links.signUp"
  | "sections.live"
  | "sections.scheduled"
  | "sections.ended"

type NavbarLink = {
  id: string
  href: string
  label: NavbarLinkLabel
}

//* Guests browse the home sections; signing in and up sit on the right
const guestLinks: NavbarLink[] = [
  { id: "live", href: `/#${lotSectionAnchors.LIVE}`, label: "sections.live" },
  {
    id: "scheduled",
    href: `/#${lotSectionAnchors.SCHEDULED}`,
    label: "sections.scheduled",
  },
  {
    id: "ended",
    href: `/#${lotSectionAnchors.ENDED}`,
    label: "sections.ended",
  },
]

const guestMenuLinks: NavbarLink[] = [
  ...guestLinks,
  { id: "sign-in", href: "/sign-in", label: "links.signIn" },
  { id: "sign-up", href: "/sign-up", label: "links.signUp" },
]

const bidderLinks: NavbarLink[] = [
  { id: "home", href: "/", label: "links.home" },
  { id: "my-bids", href: "/my-bids", label: "links.myBids" },
  { id: "wallet", href: "/wallet", label: "links.wallet" },
]

const auctioneerLinks: NavbarLink[] = [
  { id: "home", href: "/", label: "links.home" },
  { id: "auctioneer", href: "/auctioneer", label: "links.auctioneer" },
  { id: "wallet", href: "/wallet", label: "links.wallet" },
]

const linkIcons: Record<string, LucideIcon> = {
  home: HouseIcon,
  "my-bids": GavelIcon,
  wallet: WalletIcon,
  auctioneer: LayoutDashboardIcon,
  "sign-in": LogInIcon,
  "sign-up": UserPlusIcon,
  live: RadioIcon,
  scheduled: CalendarClockIcon,
  ended: SkullIcon,
}

const logoSize = 640

function isCurrentPath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function linksForRole(role: UserRole | null, isPending: boolean) {
  if (isPending) {
    return []
  }

  if (role === "BIDDER") {
    return bidderLinks
  }

  if (role === "AUCTIONEER") {
    return auctioneerLinks
  }

  return guestLinks
}

function NavbarLinks(props: {
  links: NavbarLink[]
  pathname: string
  idPrefix: string
  layout: "row" | "stack"
  onNavigate?: () => void
}) {
  const t = useTranslations("navbar")

  if (props.links.length === 0) {
    return null
  }

  const stacked = props.layout === "stack"

  return (
    <ul
      className={cn(
        stacked
          ? "flex flex-col gap-1 px-3 py-4"
          : "hidden flex-wrap items-center gap-x-7 gap-y-1 md:flex"
      )}
    >
      {props.links.map((link) => {
        const current = isCurrentPath(props.pathname, link.href)
        const Icon = linkIcons[link.id]

        return (
          <li key={link.id} className={stacked ? "w-full" : undefined}>
            <Link
              id={`${props.idPrefix}${link.id}`}
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-3 text-sm",
                stacked
                  ? "group w-full border-l-2 px-4 py-3 transition-[padding,background-color,color,border-color] duration-200 ease-out motion-safe:hover:pl-6"
                  : "relative min-h-11 text-[15px] font-bold tracking-[0.5px] uppercase transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-center after:bg-brand-red after:transition-[scale] after:duration-200 after:ease-out motion-reduce:after:transition-none",
                current
                  ? stacked
                    ? "border-background bg-background/10 text-background"
                    : "text-red-text after:scale-x-100"
                  : stacked
                    ? "border-transparent text-background/70 hover:bg-background/10 hover:text-background"
                    : "text-foreground after:scale-x-0 hover:text-red-text motion-safe:hover:after:scale-x-100"
              )}
              onClick={props.onNavigate}
            >
              {!stacked && link.id === "live" ? (
                <LiveDot size={9} className="bg-brand-red" />
              ) : null}
              {stacked && Icon ? (
                <Icon
                  className="size-4 transition-[scale] duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none"
                  aria-hidden
                />
              ) : null}
              {t(link.label)}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function SignOutButton(props: {
  id: string
  layout: "row" | "stack"
  onDone?: () => void
}) {
  const t = useTranslations("navbar")
  const router = useRouter()
  const signOut = useSignOut()
  const stacked = props.layout === "stack"

  function onClick() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        props.onDone?.()
        router.push("/")
      },
    })
  }

  return (
    <div
      className={cn(
        stacked
          ? "mt-auto border-t border-background/20 px-3 py-4"
          : "hidden md:block"
      )}
    >
      <Button
        id={props.id}
        type="button"
        variant="ghost"
        disabled={signOut.isPending}
        className={cn(
          stacked &&
            "h-auto w-full justify-start gap-3 border-l-2 border-transparent px-4 py-3 text-background/70 hover:bg-background/10 hover:text-background"
        )}
        onClick={onClick}
      >
        <LogOutIcon aria-hidden />
        {t("signOut")}
      </Button>
      {signOut.isError ? (
        <p
          id={`${props.id}-error`}
          role="alert"
          className={cn(
            "text-sm",
            stacked ? "px-4 pt-2 text-background" : "pt-1 text-destructive"
          )}
        >
          {t("signOutError")}
        </p>
      ) : null}
    </div>
  )
}

function NavbarMenu(props: {
  links: NavbarLink[]
  pathname: string
  signedIn: boolean
}) {
  const t = useTranslations("navbar")
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            id="navbar-menu"
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("menu")}
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 gap-0 border-background/20 bg-foreground p-0 text-background data-[side=left]:w-72 data-[side=left]:max-w-none data-[side=left]:sm:max-w-none [&_[data-slot=sheet-close]]:text-background [&_[data-slot=sheet-close]]:hover:bg-background/10"
      >
        <SheetHeader className="border-b border-background/20 px-5 py-6">
          <SheetTitle className="pr-8 font-heading text-xl tracking-tight text-background">
            {t("brand")}
          </SheetTitle>
        </SheetHeader>
        <NavbarLinks
          links={props.links}
          pathname={props.pathname}
          idPrefix="navbar-menu-link-"
          layout="stack"
          onNavigate={closeMenu}
        />
        <div className="mt-auto">
          {props.signedIn ? (
            <SignOutButton
              id="navbar-menu-sign-out"
              layout="stack"
              onDone={closeMenu}
            />
          ) : null}
          {/* On phones the header only fits the brand and this menu */}
          <div className="flex items-center gap-3 border-t border-background/20 px-7 py-4">
            <LanguageSelect id="navbar-menu-language" />
            <ThemeToggle id="navbar-menu-theme" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function GuestActions() {
  const t = useTranslations("navbar")

  return (
    <>
      <Link
        id="navbar-link-sign-in"
        href="/sign-in"
        className="flex min-h-11 items-center text-[15px] font-bold text-foreground uppercase no-underline hover:text-red-text"
      >
        {t("links.signIn")}
      </Link>
      <Link
        id="navbar-link-sign-up"
        href="/sign-up"
        className={buttonVariants({
          variant: "secondary",
          size: "sm",
          className: "no-underline",
        })}
      >
        {t("links.signUp")}
      </Link>
    </>
  )
}

export function Navbar() {
  const t = useTranslations("navbar")
  const pathname = usePathname()
  const session = useAuthSession()
  const parsedRole = userRoleSchema.safeParse(session.data?.user.role)
  const links = linksForRole(
    parsedRole.success ? parsedRole.data : null,
    session.isPending
  )
  const signedIn = !session.isPending && session.data != null
  const guest = !session.isPending && session.data == null

  return (
    <header className="sticky top-0 z-40 border-b-4 border-brand-red bg-header text-foreground print:hidden">
      <nav
        aria-label={t("label")}
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-[clamp(16px,4vw,48px)] py-2.5"
      >
        <Link
          id="navbar-brand"
          href="/"
          aria-label={t("brand")}
          className="flex items-center gap-3 text-foreground no-underline"
        >
          <Image
            src="/design/logo.png"
            alt=""
            width={logoSize}
            height={logoSize}
            sizes="56px"
            preload
            className="block size-14"
          />
          <Wordmark />
        </Link>
        <NavbarLinks
          links={links}
          pathname={pathname}
          idPrefix="navbar-link-"
          layout="row"
        />
        <div className="flex items-center gap-4">
          <div className="hidden flex-wrap items-center gap-x-4 gap-y-3 md:flex">
            <LanguageSelect id="navbar-language" />
            <ThemeToggle id="navbar-theme" />
            {signedIn ? (
              <SignOutButton id="navbar-sign-out" layout="row" />
            ) : null}
            {guest ? <GuestActions /> : null}
          </div>
          {links.length > 0 ? (
            <div className="md:hidden">
              <NavbarMenu
                links={guest ? guestMenuLinks : links}
                pathname={pathname}
                signedIn={signedIn}
              />
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
