//* Libraries imports
import * as z from "zod"

export const apiResponseErrorSchema = z.object({
  message: z.string(),
  type: z.string().optional(),
  on: z.string().optional(),
  property: z.string().optional(),
  found: z.unknown().optional(),
  errors: z.array(z.unknown()).optional(),
})

export type ApiResponseError = z.infer<typeof apiResponseErrorSchema>
