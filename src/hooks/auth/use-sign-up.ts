"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

export type SignUpInput = {
  name: string
  email: string
  password: string
}

export class SignUpError extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.name = "SignUpError"
    this.code = code
  }
}

async function signUp(input: SignUpInput) {
  const result = await authClient.signUp.email({
    name: input.name,
    email: input.email,
    password: input.password,
  })

  if (result.error) {
    const code = result.error.code

    throw new SignUpError(typeof code === "string" ? code : "")
  }

  return result.data
}

export function useSignUp() {
  return useMutation({
    mutationFn: signUp,
    retry: false,
    onSuccess: () => {
      //clear the query client
      queryClient.clear()
    },
  })
}
