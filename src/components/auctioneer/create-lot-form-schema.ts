//* Libraries imports
import * as z from "zod"

//* Hooks imports
import {
  storeLotSchema,
  type StoreLot,
} from "@/src/hooks/lots/mutations/use-store-lot"

const lotCardFieldSchema = z.object({
  cardId: z.number().int().positive(),
  name: z.string().min(1),
  imageUrl: z.string().optional(),
})

export type LotCardField = z.infer<typeof lotCardFieldSchema>

export const createLotFormSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    openingBid: z.string(),
    minIncrement: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    cards: z.array(lotCardFieldSchema),
  })
  .superRefine((values, context) => {
    const parsed = storeLotSchema.safeParse(toStoreLotInput(values))

    if (parsed.success) {
      return
    }

    for (const issue of parsed.error.issues) {
      context.addIssue({
        code: "custom",
        path: toFormPath(issue.path),
        message: issue.message,
      })
    }
  })

export type CreateLotFormValues = z.infer<typeof createLotFormSchema>

export const emptyCreateLotForm: CreateLotFormValues = {
  title: "",
  description: "",
  openingBid: "",
  minIncrement: "",
  startsAt: "",
  endsAt: "",
  cards: [],
}

export function toStoreLot(values: CreateLotFormValues): StoreLot {
  return storeLotSchema.parse(toStoreLotInput(values))
}

function toStoreLotInput(values: CreateLotFormValues) {
  return {
    title: values.title,
    description: values.description,
    openingBid: values.openingBid,
    minIncrement: values.minIncrement,
    startsAt: toOffsetDateTime(values.startsAt),
    endsAt: toOffsetDateTime(values.endsAt),
    cardIds: values.cards.map((card) => card.cardId),
  }
}

export function toOffsetDateTime(value: string) {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return trimmed
  }

  const date = new Date(trimmed)

  if (Number.isNaN(date.getTime())) {
    return trimmed
  }

  return date.toISOString()
}

function toFormPath(path: readonly PropertyKey[]): PropertyKey[] {
  if (path[0] !== "cardIds") {
    return [...path]
  }

  return ["cards", ...path.slice(1)]
}
