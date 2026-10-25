//* Libraries imports
import * as z from "zod"

export const signInSchema = z.object({
  email: z.email("INVALID_EMAIL"),
  password: z
    .string()
    .min(8, "PASSWORD_TOO_SHORT")
    .max(128, "PASSWORD_TOO_LONG"),
})

export type SignInValues = z.infer<typeof signInSchema>
