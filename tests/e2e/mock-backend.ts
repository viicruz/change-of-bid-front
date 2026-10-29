//* Node imports
import { createServer, type ServerResponse } from "node:http"
import { pathToFileURL } from "node:url"

//* The Next server reads the session on the server, where page.route cannot reach.
//* This backend answers that call; the browser calls stay mocked with page.route.
export const mockBackendPort = 3101

export const sessionCookieName = "better-auth.session_token"

type Role = "AUCTIONEER" | "BIDDER"

export function sessionToken(role: Role) {
  return `e2e-${role.toLowerCase()}`
}

function readCookie(header: string | undefined, name: string) {
  for (const pair of header?.split(";") ?? []) {
    const [key, ...value] = pair.trim().split("=")

    if (key === name) {
      return value.join("=")
    }
  }

  return undefined
}

function roleFromToken(token: string | undefined): Role | null {
  if (token === sessionToken("AUCTIONEER")) {
    return "AUCTIONEER"
  }

  if (token === sessionToken("BIDDER")) {
    return "BIDDER"
  }

  return null
}

function sessionPayload(role: Role) {
  return {
    session: {
      id: "session-id",
      userId: "user-id",
      expiresAt: "2099-10-28T21:00:00.000Z",
    },
    user: {
      id: "user-id",
      name: "Ada Lovelace",
      email: "ada@example.com",
      emailVerified: true,
      image: null,
      createdAt: "2026-10-24T18:00:00.000Z",
      updatedAt: "2026-10-24T18:00:00.000Z",
      role,
    },
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" })
  response.end(JSON.stringify(body))
}

function startMockBackend() {
  const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost")

    if (request.method === "GET" && pathname === "/api/auth/get-session") {
      const role = roleFromToken(
        readCookie(request.headers.cookie, sessionCookieName)
      )

      sendJson(response, 200, role ? sessionPayload(role) : null)
      return
    }

    sendJson(response, 404, { message: "Not mocked" })
  })

  server.listen(mockBackendPort)
}

function isMain() {
  const entry = process.argv[1]

  return entry !== undefined && import.meta.url === pathToFileURL(entry).href
}

if (isMain()) {
  startMockBackend()
}
