//* Libraries imports
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

//* Env imports
import { env } from "@/src/env/client"

const TOKEN_KEY = "change-of-bid.bearer-token"

export function readBearerToken() {
  if (typeof window === "undefined") {
    return undefined
  }

  return sessionStorage.getItem(TOKEN_KEY) ?? undefined
}

export function clearBearerToken() {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.removeItem(TOKEN_KEY)
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
      token: readBearerToken,
    },
    onSuccess: (context) => {
      storeToken(context.response)
    },
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: ["AUCTIONEER", "BIDDER"],
          required: true,
          input: true,
        },
      },
    }),
  ],
})
