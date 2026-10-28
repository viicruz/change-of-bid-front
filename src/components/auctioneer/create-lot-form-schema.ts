//* Libraries imports
import type { FieldErrors } from "react-hook-form"
import * as z from "zod"

//* Hooks imports
import {
  storeLotSchema,
  type StoreLot,
} from "@/src/hooks/lots/mutations/use-store-lot"

//* Schema imports
import { cardAttributeSchema } from "@/src/schemas/card"

//* Lib imports
import { cardTypes } from "@/src/lib/lots/mock-lots"

const lotCardFieldSchema = z.object({
  cardId: z.number().int().positive(),
  name: z.string().min(1),
  //* Kept for the lot rows only: the API takes card ids
  cardType: z.enum(cardTypes),
  attribute: cardAttributeSchema.optional(),
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
      const path = toFormPath(issue.path)

      context.addIssue({
        code: "custom",
        path,
        message: emptyDateMessage(values, path) ?? issue.message,
      })
    }
  })

//* An empty date is a missing choice, not a malformed ISO string
const emptyDateMessageCode = {
  startsAt: "LOT_STARTS_AT_REQUIRED",
  endsAt: "LOT_ENDS_AT_REQUIRED",
} as const

function emptyDateMessage(
  values: { startsAt: string; endsAt: string },
  path: readonly PropertyKey[]
) {
  const field = path[0]

  if (field !== "startsAt" && field !== "endsAt") {
    return undefined
  }

  if (values[field].trim().length > 0) {
    return undefined
  }

  return emptyDateMessageCode[field]
}

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

//* The cards array error sits on the array itself or on its root
export function readCardsError(
  error: FieldErrors<CreateLotFormValues>["cards"]
) {
  if (!error) {
    return undefined
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message
  }

  if ("root" in error && error.root && typeof error.root.message === "string") {
    return error.root.message
  }

  return undefined
}
