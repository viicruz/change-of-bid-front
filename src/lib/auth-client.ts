//* Libraries imports
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

//* Local imports
import { backendBaseUrl } from "@/src/lib/backend-url"

export const authClient = createAuthClient({
  //* better-auth only appends /api/auth to a base URL without a path
  baseURL: `${backendBaseUrl()}/api/auth`,
  fetchOptions: {
    credentials: "include",
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
