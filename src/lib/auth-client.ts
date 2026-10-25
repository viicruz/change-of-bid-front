//* Libraries imports
import { createAuthClient } from "better-auth/react"

//* Env imports
import { env } from "@/src/env/client"

const TOKEN_KEY = "change-of-bid.bearer-token"

function readToken() {
  if (typeof window === "undefined") {
    return undefined
  }

  return sessionStorage.getItem(TOKEN_KEY) ?? undefined
}

function storeToken(response: Response) {
  if (typeof window === "undefined") {
    return
  }

  const token = response.headers.get("set-auth-token")

  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  fetchOptions: {
    credentials: "include",
    auth: {
      type: "Bearer",
      token: readToken,
    },
    onSuccess: (context) => {
      storeToken(context.response)
    },
  },
})
