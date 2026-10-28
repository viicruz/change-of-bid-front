import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/lib/utils"

const badgeVariants = cva(
  //* Design system badge: Bungee, black 2px outline, flat color
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-none border-2 border-black px-2 py-0.5 font-heading text-xs font-normal whitespace-nowrap transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-brand-red [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        //* Live / highest bid
        default: "bg-brand-red text-white [a]:hover:bg-brand-red-dark",
        //* Scheduled / ahead / success
        secondary:
          "bg-brand-yellow text-brand-ink [a]:hover:bg-brand-yellow/80",
        //* Neutral info (e.g. "7 cartas")
        dark: "bg-brand-ink text-brand-yellow",
        //* Closed: inverts with the theme
        inverse: "bg-foreground text-background",
        destructive: "border-destructive bg-transparent text-destructive",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-muted",
        ghost: "border-transparent hover:bg-muted hover:text-muted-foreground",
        link: "border-transparent font-sans font-bold text-red-text underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
