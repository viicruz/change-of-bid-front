"use client"

//* Libraries imports
import { useMutation } from "@tanstack/react-query"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

//* Schema imports
import { authUserSchema } from "@/src/schemas/user"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

/** @expected-unused */
export type SignInInput = {
  email: string
  password: string
}

export class SignInError extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.name = "SignInError"
    this.code = code
  }
}

async function signIn(input: SignInInput) {
  const result = await authClient.signIn.email({
    email: input.email,
    password: input.password,
  })

  if (result.error) {
    const code = result.error.code

    throw new SignInError(typeof code === "string" ? code : "")
  }

  const user = authUserSchema.safeParse(result.data?.user)

  if (!user.success) {
    throw new SignInError("")
  }

  return {
    ...result.data,
    user: user.data,
  }
}

export function useSignIn() {
  return useMutation({
    mutationFn: signIn,
    retry: false,
    onSuccess: () => {
      //clear the query client
      queryClient.clear()
    },
  })
}
