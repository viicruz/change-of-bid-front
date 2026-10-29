//* Libraries imports
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

//* Local imports
import { backendBaseUrl } from "@/src/lib/backend-url"

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
  //* better-auth only appends /api/auth to a base URL without a path
  baseURL: `${backendBaseUrl()}/api/auth`,
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
