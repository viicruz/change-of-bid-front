//* Libraries imports
import Image from "next/image";
import Link from "next/link";

//* Components imports
import { DesignThemeToggle } from "@/src/components/design/design-interactive"
import { HighlightWord, Tag } from "@/src/components/design/design-primitives"

const sectionLinks = [
  { href: "#cores", label: "Cores" },
  { href: "#tipografia", label: "Tipografia" },
  { href: "#forma", label: "Forma" },
  { href: "#componentes", label: "Componentes" },
  { href: "#icones", label: "Ícones" },
  { href: "#animacoes", label: "Animações" },
  { href: "#voz", label: "Voz" },
]

export function DesignHeader() {
  //* Sticks right below the app navbar (sticky, 57px tall) on large screens
  return (
    <header className="z-20 border-b-4 border-(--cob-red) bg-(--head-bg) text-(--head-text) lg:sticky lg:top-14">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[clamp(16px,4vw,48px)] py-2.5">
        <Link
          href="#top"
          className="flex items-center gap-3 text-(--head-text) no-underline"
        >
          <Image
            src="/design/logo.png"
            alt=""
            width={56}
            height={56}
            className="block size-14"
            priority
          />
          <span className="cob-display text-[22px] leading-none">
            CHANGE <span className="text-(--yellow-text)">OF</span>{" "}
            <span className="text-(--cob-red)">BID</span>
          </span>
          <span className="cob-display border-3 border-black bg-(--cob-tinta) px-2 py-1 text-xs text-(--cob-yellow)">
            Design System
          </span>
        </Link>
        <nav
          aria-label="Seções"
          className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold tracking-[0.5px] uppercase"
        >
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center text-(--head-text) no-underline hover:text-(--red-text)"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <DesignThemeToggle />
      </div>
    </header>
  )
}

const principles = [
  { title: "Bordas retas", description: "Raio zero. Sempre.", shadow: "red" },
  {
    title: "Contorno grosso",
    description: "2 a 4px de traço preto.",
    shadow: "neutral",
  },
  {
    title: "Sombra chapada",
    description: "Deslocada, sem blur.",
    shadow: "neutral",
  },
  {
    title: "Inclinação = energia",
    description: "Tags e selos tortos.",
    shadow: "red",
    tilted: true,
  },
]

export function DesignIntro() {
  return (
    <section className="flex flex-wrap items-center gap-10 pt-16 pb-14">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-[22px]">
        <Tag tone="yellow" className="text-sm">
          v1.0 · Out 2026
        </Tag>
        <h1 className="cob-display m-0 text-[clamp(44px,6vw,84px)] leading-[0.98]">
          O DECK DE <HighlightWord>DESIGN</HighlightWord>
        </h1>
        <p className="m-0 max-w-[640px] text-[19px] leading-[1.55] text-(--muted)">
          Tudo o que monta a cara do Change of Bid: cores, tipografia, forma,
          componentes, ícones, movimento e voz. Use esta página como referência
          ao criar telas novas — se algo não está aqui, provavelmente ainda não
          faz parte do sistema.
        </p>
      </div>
      <div className="grid min-w-0 flex-[1_1_320px] grid-cols-2 gap-3.5">
        {principles.map((principle) => (
          <div
            key={principle.title}
            className={
              "border-4 border-(--ink) bg-(--surface) p-4 " +
              (principle.shadow === "red"
                ? "shadow-[6px_6px_0_var(--cob-red)]"
                : "shadow-[6px_6px_0_var(--shadow)]") +
              (principle.tilted ? " -rotate-[1.5deg]" : "")
            }
          >
            <div className="cob-display text-base">{principle.title}</div>
            <div className="mt-1.5 text-sm text-(--muted)">
              {principle.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function DesignFooter() {
  return (
    <footer className="border-t-8 border-(--cob-red) bg-(--cob-tinta) text-[#A9A2B3]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 px-[clamp(16px,4vw,48px)] py-[22px] text-[13px]">
        <span>Change of Bid · Design System v1.0</span>
        <span>
          Fontes: Bungee e Chakra Petch (Google Fonts, SIL Open Font License).
        </span>
      </div>
    </footer>
  )
}
