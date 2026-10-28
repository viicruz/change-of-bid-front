//* Libraries imports
import type { ComponentProps, ReactNode } from "react"

//* Lib imports
import { cn } from "@/src/lib/utils"

const tagTones = {
  red: "bg-brand-red text-white",
  yellow: "bg-brand-yellow text-brand-ink",
  dark: "bg-brand-ink text-brand-yellow",
  inverse: "bg-foreground text-background",
}

type TagProps = ComponentProps<"span"> & {
  tone?: keyof typeof tagTones
}

/** Skewed (-10°) section/status tag. */
export function Tag({ tone = "red", className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "flex -skew-x-10 items-center gap-2 self-start border-3 border-black px-3 py-1.5 font-heading text-[13px]",
        tagTones[tone],
        className
      )}
      {...props}
    />
  )
}

/** Red box that highlights one word of a title. */
export function HighlightWord({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-block -skew-x-8 border-4 border-black bg-brand-red px-3.5 text-white shadow-hard-6 shadow-brand-yellow",
        className
      )}
      {...props}
    />
  )
}

/** Square dot that pulses next to anything live. */
export function LiveDot({
  size = 8,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block animate-live-pulse bg-white", className)}
      style={{ width: size, height: size }}
    />
  )
}

export function ArrowRightIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
    >
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  )
}

/** Brand wordmark: CHANGE, then OF in yellow and BID in red. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-heading text-[22px] leading-none", className)}>
      CHANGE <span className="text-yellow-text">OF</span>{" "}
      <span className="text-brand-red">BID</span>
    </span>
  )
}

type SectionHeadingProps = {
  id: string
  tag: ReactNode
  title: ReactNode
  description: ReactNode
  className?: string
  descriptionClassName?: string
  children?: ReactNode
}

/** Section opener: tag, big title, subtitle and an optional slot on the right. */
export function SectionHeading(props: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-wrap items-end justify-between gap-5",
        props.className
      )}
    >
      <div className="flex flex-col gap-3.5">
        {props.tag}
        <h2
          id={props.id}
          className="m-0 font-heading text-[clamp(36px,5vw,64px)] leading-none font-normal"
        >
          {props.title}
        </h2>
        <p
          className={cn(
            "m-0 max-w-140 text-lg text-muted-foreground",
            props.descriptionClassName
          )}
        >
          {props.description}
        </p>
      </div>
      {props.children}
    </div>
  )
}
