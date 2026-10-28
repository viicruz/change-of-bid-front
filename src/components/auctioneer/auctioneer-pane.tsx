//* Libraries imports
import type { ReactNode } from "react"

//* Lib imports
import { cn } from "@/src/lib/utils"

//* Shell shared by the page columns: thick ink border and a hard shadow
export const auctioneerPaneClassName =
  "flex min-w-0 flex-col border-4 border-border bg-card text-card-foreground"

type AuctioneerPaneHeaderProps = {
  titleId: string
  title: string
  aside?: ReactNode
  className?: string
}

//* Dark title strip that stays dark in both themes
export function AuctioneerPaneHeader(props: AuctioneerPaneHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b-4 border-black bg-brand-ink px-4 py-3.5 text-white",
        props.className
      )}
    >
      <h2 id={props.titleId} className="font-heading text-lg font-normal">
        {props.title}
      </h2>
      {props.aside}
    </div>
  )
}
