"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"

//* Auth imports
import {
  authClient,
  clearBearerToken,
  readBearerToken,
} from "@/src/lib/auth-client"

//* Local imports
import { backendBaseUrl } from "@/src/lib/backend-url"
import { queryClient } from "@/src/lib/query-client"

/** @expected-unused */
export class SignOutError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Sign out failed with status ${status}`)
    this.name = "SignOutError"
    this.status = status
  }
}

function signOutUrl() {
  return `${backendBaseUrl()}/api/auth/sign-out`
}

async function signOut() {
  const token = readBearerToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(signOutUrl(), {
    method: "POST",
    credentials: "include",
    headers,
    body: "{}",
  })

  if (!response.ok) {
    throw new SignOutError(response.status)
  }
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
    retry: false,
    onSuccess: () => {
      clearBearerToken()
      queryClient.clear()
      authClient.$store.notify("$sessionSignal")
    },
  })
}
