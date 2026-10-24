//* Libraries imports
import { createAuthClient } from "better-auth/react"

//* Env imports
import { env } from "@/src/env/client"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  fetchOptions: {
    credentials: "include",
  },
})
