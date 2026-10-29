//* Libraries imports
import { z } from "zod"

//* Local imports
import { imageSchema } from "@/src/schemas/common/image"

const lotStatusSchema = z.enum(["ACTIVE"])
export const lotStatusEnum = lotStatusSchema.enum

export const publicLotStatusSchema = z.enum(["SCHEDULED", "LIVE", "ENDED"])
export type PublicLotStatus = z.infer<typeof publicLotStatusSchema>

export const privateLotStatusSchema = z.enum([
  "SCHEDULED",
  "LIVE",
  "ENDED",
  "CANCELED",
])
export type PrivateLotStatus = z.infer<typeof privateLotStatusSchema>
export const privateLotStatusEnum = privateLotStatusSchema.enum

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
  quantity: z.number().int().positive(),
  cardName: z.string(),
  imagePath: imageSchema,
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
