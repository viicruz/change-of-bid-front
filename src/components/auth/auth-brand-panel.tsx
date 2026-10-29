//* Libraries imports
import Image from "next/image"

//* Components imports
import { HighlightWord, Tag } from "@/src/components/ui/brand"

//* Lib imports
import { cn } from "@/src/lib/utils"

const cardWidth = 813
const cardHeight = 1185
const logoSize = 640

type AuthBrandPanelProps = {
  logoAlt: string
  tag: string
  titleA: string
  titleB: string
  description: string
  //* Fanned hand at the bottom: image path plus position, rotation and shadow
  cards: readonly { src: string; className: string }[]
}

/** Left panel of the auth pages: always dark, like the stage. */
export function AuthBrandPanel(props: AuthBrandPanelProps) {
  return (
    <aside className="relative flex min-w-0 flex-[1_1_440px] flex-col gap-8 overflow-hidden border-r-6 border-brand-red bg-brand-ink bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.08)_0_2px,transparent_2px_24px)] p-[clamp(28px,4vw,56px)] text-white">
      <Image
        src="/design/logo.png"
        alt={props.logoAlt}
        width={logoSize}
        height={logoSize}
        sizes="(min-width: 1334px) 240px, 160px"
        preload
        className="block h-auto w-[clamp(160px,18vw,240px)]"
      />
      <div className="flex max-w-120 flex-col gap-4.5">
        <Tag tone="yellow" className="text-sm">
          {props.tag}
        </Tag>
        <h1 className="m-0 font-heading text-[clamp(40px,4.6vw,68px)] leading-[0.98] font-normal">
          {props.titleA}{" "}
          <HighlightWord className="px-3">{props.titleB}</HighlightWord>
        </h1>
        <p className="m-0 text-lg leading-normal text-[#d9d4e0]">
          {props.description}
        </p>
      </div>
      <div aria-hidden="true" className="relative mt-auto h-60 shrink-0">
        {props.cards.map((card) => (
          <Image
            key={card.src}
            src={card.src}
            alt=""
            width={cardWidth}
            height={cardHeight}
            sizes="130px"
            className={cn(
              "absolute block w-32.5 border-4 border-black shadow-hard-6",
              card.className
            )}
          />
        ))}
      </div>
    </aside>
  )
}
