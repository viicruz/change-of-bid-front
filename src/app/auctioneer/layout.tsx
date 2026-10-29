//* Libraries imports
import type { ReactNode } from "react"

//* Components imports
import { RequireAuctioneer } from "@/src/components/auth/require-auctioneer"

type AuctioneerLayoutProps = {
  children: ReactNode
}

export default function AuctioneerLayout(props: AuctioneerLayoutProps) {
  return <RequireAuctioneer>{props.children}</RequireAuctioneer>
}
