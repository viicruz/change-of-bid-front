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

export function Panel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-4 border-border bg-card", className)}
      {...props}
    />
  )
}

export function Eyebrow({ className, ...props }: ComponentProps<"strong">) {
  return (
    <strong
      className={cn(
        "text-[13px] font-bold tracking-[1px] text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

export function Code({ className, ...props }: ComponentProps<"code">) {
  return <code className={cn("ds-code", className)} {...props} />
}

export function LiveDot({ size = 8 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block animate-live-pulse bg-white"
      style={{ width: size, height: size }}
    />
  )
}

type DesignSectionProps = {
  id: string
  number: string
  title: string
  description: ReactNode
  className?: string
  children: ReactNode
}

export function DesignSection({
  id,
  number,
  title,
  description,
  className,
  children,
}: DesignSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "flex scroll-mt-16 flex-col gap-8 border-t-4 border-border py-14 lg:scroll-mt-36",
        className
      )}
    >
      <div className="flex flex-col gap-2.5">
        <Tag className="px-2.5 py-1">{number}</Tag>
        <h2
          id={`${id}-title`}
          className="m-0 font-heading text-[clamp(36px,4.4vw,56px)] leading-none"
        >
          {title}
        </h2>
        <p className="m-0 max-w-[680px] text-[17px] text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

export function SubHeading({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn("m-0 font-heading text-[22px]", className)} {...props} />
  )
}
