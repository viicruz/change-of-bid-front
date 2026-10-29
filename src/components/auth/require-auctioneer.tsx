"use client"

//* Libraries imports
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

//* Hooks imports
import { useAuthSession } from "@/src/hooks/auth/use-auth-session"

//* Schema imports
import { userRoleSchema } from "@/src/schemas/user"

type RequireAuctioneerProps = {
  children: ReactNode
}

export function RequireAuctioneer(props: RequireAuctioneerProps) {
  const router = useRouter()
  const session = useAuthSession()
  const parsedRole = userRoleSchema.safeParse(session.data?.user.role)
  const isAuctioneer =
    !session.isPending && parsedRole.success && parsedRole.data === "AUCTIONEER"

  useEffect(() => {
    if (session.isPending || isAuctioneer) {
      return
    }

    router.replace("/")
  }, [isAuctioneer, router, session.isPending])

  if (!isAuctioneer) {
    return null
  }

  return props.children
}
