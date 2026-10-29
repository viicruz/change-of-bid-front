import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/src/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        //* Design system field: 3px edge, 52px tall, yellow hard shadow on focus
        "h-13 w-full min-w-0 rounded-none border-3 border-input bg-field px-3.5 py-3 text-base text-foreground transition-shadow duration-[120ms] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-heading file:text-sm file:text-foreground placeholder:text-muted-foreground placeholder:opacity-80 focus:shadow-hard-5 focus:shadow-brand-yellow disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-brand-red motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
