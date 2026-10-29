import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/src/lib/utils"

//* Design system press: hover lifts 3px, click sinks 2px toward the shadow
//* No base border color: Tailwind sorts `border-transparent` after colors like
//* `border-black`, so it would hide every variant's border
const press =
  "transition-transform duration-[120ms] ease-out hover:-translate-x-[3px] hover:-translate-y-[3px] active:translate-x-[2px] active:translate-y-[2px] motion-reduce:transition-none"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none font-heading font-normal whitespace-nowrap outline-none select-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none aria-invalid:border-destructive data-disabled:pointer-events-none data-disabled:opacity-45 data-disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      //* Variants set the shadow color; sizes set the shadow offset
      variant: {
        //* White on red only reaches AA at 18px+: keep it on default/lg sizes
        default: cn(
          press,
          "border-black bg-primary text-primary-foreground shadow-brand-yellow"
        ),
        secondary: cn(
          press,
          "border-black bg-secondary text-secondary-foreground shadow-brand-red"
        ),
        dark: cn(
          press,
          "border-black bg-brand-ink text-brand-yellow shadow-brand-red aria-pressed:bg-brand-yellow aria-pressed:text-brand-ink"
        ),
        outline: cn(
          press,
          "border-edge bg-transparent text-edge aria-expanded:bg-accent"
        ),
        ghost:
          "font-sans font-bold tracking-[0.5px] uppercase hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        destructive: cn(
          press,
          "border-destructive bg-transparent text-destructive focus-visible:outline-destructive"
        ),
        link: "font-sans font-bold text-red-text underline underline-offset-4 hover:text-foreground",
      },
      size: {
        default:
          "h-13 gap-2 border-4 px-[22px] text-lg shadow-hard-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 gap-1 border-2 px-2.5 text-xs shadow-hard-2 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-11 gap-1.5 border-3 px-[18px] text-[15px] shadow-hard-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-16 gap-2 border-4 px-7 text-[22px] shadow-hard-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-6",
        icon: "size-11 border-3 shadow-hard-4",
        "icon-xs":
          "size-7 border-2 shadow-hard-2 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm":
          "size-9 border-2 shadow-hard-3 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg":
          "size-13 border-4 shadow-hard-6 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    compoundVariants: [
      //* Outline and destructive have a border but no shadow
      {
        variant: ["outline", "destructive"],
        className: "shadow-none",
      },
      //* Ghost and link stay flat: no border or shadow. The size's border
      //* width can outlive `border-0`, so the color is cleared as well
      {
        variant: ["ghost", "link"],
        className: "border-0 border-transparent shadow-none",
      },
      {
        variant: "ghost",
        size: ["default", "lg"],
        className: "text-sm",
      },
      {
        variant: "link",
        className: "h-auto min-h-11 px-0 text-[15px]",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, press }
