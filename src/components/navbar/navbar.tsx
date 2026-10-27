"use client"

//* Libraries imports
import {
  GavelIcon,
  HouseIcon,
  LayoutDashboardIcon,
  LogInIcon,
  MenuIcon,
  UserPlusIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

//* Components imports
import { LanguageSelect } from "@/src/components/button/language-select"
import { Button } from "@/src/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"

//* Schema imports
import { userRoleSchema, type UserRole } from "@/src/schemas/user"

//* Lib imports
import { cn } from "@/src/lib/utils"

type NavbarLinkLabel =
  "home" | "myBids" | "wallet" | "auctioneer" | "signIn" | "signUp"

type NavbarLink = {
  id: string
  href: string
  label: NavbarLinkLabel
}

const guestLinks: NavbarLink[] = [
  { id: "sign-in", href: "/sign-in", label: "signIn" },
  { id: "sign-up", href: "/sign-up", label: "signUp" },
]

const bidderLinks: NavbarLink[] = [
  { id: "home", href: "/", label: "home" },
  { id: "my-bids", href: "/my-bids", label: "myBids" },
  { id: "wallet", href: "/wallet", label: "wallet" },
]

const auctioneerLinks: NavbarLink[] = [
  { id: "home", href: "/", label: "home" },
  { id: "auctioneer", href: "/auctioneer", label: "auctioneer" },
]

const linkIcons: Record<string, LucideIcon> = {
  home: HouseIcon,
  "my-bids": GavelIcon,
  wallet: WalletIcon,
  auctioneer: LayoutDashboardIcon,
  "sign-in": LogInIcon,
  "sign-up": UserPlusIcon,
}

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
          : "hidden items-center gap-1 md:flex"
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
                  : "relative px-2.5 py-1.5 text-muted-foreground transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:bg-foreground after:transition-[scale] after:duration-200 after:ease-out motion-reduce:after:transition-none",
                current
                  ? stacked
                    ? "border-background bg-background/10 text-background"
                    : "text-foreground after:scale-x-100"
                  : stacked
                    ? "border-transparent text-background/70 hover:bg-background/10 hover:text-background"
                    : "after:scale-x-0 hover:text-foreground motion-safe:hover:after:scale-x-100"
              )}
              onClick={props.onNavigate}
            >
              {stacked && Icon ? (
                <Icon
                  className="size-4 transition-[scale] duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none"
                  aria-hidden
                />
              ) : null}
              {t(`links.${link.label}`)}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function NavbarMenu(props: { links: NavbarLink[]; pathname: string }) {
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
      </SheetContent>
    </Sheet>
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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <nav
        aria-label={t("label")}
        className="flex items-center justify-between gap-4 px-6 py-3"
      >
        <div className="flex items-center gap-6">
          <Link
            id="navbar-brand"
            href="/"
            className="font-heading text-lg tracking-tight"
          >
            {t("brand")}
          </Link>
          <NavbarLinks
            links={links}
            pathname={pathname}
            idPrefix="navbar-link-"
            layout="row"
          />
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelect />
          {links.length > 0 ? (
            <div className="md:hidden">
              <NavbarMenu links={links} pathname={pathname} />
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  )
}
