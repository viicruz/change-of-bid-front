//* Libraries imports
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import * as z from "zod"

//* Local imports
import { backendBaseUrl } from "@/src/lib/backend-url"

//* Schema imports
import { userRoleSchema } from "@/src/schemas/user"

const serverSessionSchema = z
  .object({
    user: z.object({
      role: userRoleSchema,
    }),
  })
  .nullable()

/**
 * Reads the session from the backend, forwarding the request cookies.
 * The browser talks to the same-origin proxy, so the session cookie reaches the Next server.
 * Any failure counts as signed out.
 */
export const getServerSession = cache(async () => {
  const cookie = (await headers()).get("cookie")

  if (!cookie) {
    return null
  }

  try {
    const response = await fetch(`${backendBaseUrl()}/api/auth/get-session`, {
      headers: {
        Accept: "application/json",
        Cookie: cookie,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const parsed = serverSessionSchema.safeParse(await response.json())

    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
})

export async function requireAuctioneer() {
  const session = await getServerSession()

  //* redirect throws, so it must stay outside the try/catch above
  if (session?.user.role !== "AUCTIONEER") {
    redirect("/")
  }

  return session
}
