"use client"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

export function useAuthSession() {
  return authClient.useSession()
}
