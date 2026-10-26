//* Libraries imports
import * as z from "zod"

export const lotStatusSchema = z.enum(["ACTIVE"])
export type LotStatus = z.infer<typeof lotStatusSchema>
export const lotStatusEnum = lotStatusSchema.enum
export const lotStatusArray: LotStatus[] = Object.values(lotStatusEnum)

const responseMoneySchema = z
  .string()
  .regex(/^(?:0\.(?:0[1-9]|[1-9]\d)|[1-9]\d*\.\d{2})$/)

const responseDateTimeSchema = z.iso
  .datetime({ offset: true })
  .pipe(z.coerce.date())

export const lotItemSchema = z.object({
  id: z.uuid(),
  position: z.number().int().positive(),
  cardId: z.number().int().positive(),
  quantity: z.literal(1),
  cardName: z.string(),
  imagePath: z.url(),
})

export type LotItem = z.infer<typeof lotItemSchema>

export const lotSchema = z.object({
  id: z.uuid(),
  auctioneerId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  openingBid: responseMoneySchema,
  minIncrement: responseMoneySchema,
  startsAt: responseDateTimeSchema,
  originalEndsAt: responseDateTimeSchema,
  endsAt: responseDateTimeSchema,
  status: lotStatusSchema,
  items: z.array(lotItemSchema).min(1),
})

export type Lot = z.infer<typeof lotSchema>
