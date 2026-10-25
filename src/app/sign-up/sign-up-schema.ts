//* Libraries imports
import * as z from "zod"

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "NAME_REQUIRED"),
    email: z.email("INVALID_EMAIL"),
    password: z
      .string()
      .min(8, "PASSWORD_TOO_SHORT")
      .max(128, "PASSWORD_TOO_LONG"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    error: "PASSWORDS_DO_NOT_MATCH",
  })

export type SignUpValues = z.infer<typeof signUpSchema>
