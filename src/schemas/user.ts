//* Libraries imports
import * as z from "zod"

export const userRoleSchema = z.enum(["AUCTIONEER", "BIDDER"])
export type UserRole = z.infer<typeof userRoleSchema>

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: userRoleSchema,
})
