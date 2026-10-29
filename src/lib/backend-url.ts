//* Env imports
import { env } from "@/src/env/client"

//* Must match the rewrite source in next.config.ts
const backendProxyPath = "/backend"

/**
 * Base URL for requests that carry the session cookie.
 * The browser calls the same-origin proxy, so the cookie stays first-party.
 * Outside the browser there is no page origin, so it calls the backend directly.
 */
export function backendBaseUrl() {
  if (typeof window === "undefined") {
    return env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "")
  }

  return `${window.location.origin}${backendProxyPath}`
}
