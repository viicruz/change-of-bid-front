//* Libraries imports
import type { ComponentProps, ReactNode } from "react"

//* Components imports
import { Tag } from "@/src/components/ui/brand"

//* Lib imports
import { cn } from "@/src/lib/utils"

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
