//* Libraries imports
import * as z from "zod"

function defineEnum<const T extends readonly [string, ...string[]]>(values: T) {
  const schema = z.enum(values)
  const array = Object.values(schema.enum) as Array<z.infer<typeof schema>>

  return {
    schema,
    array,
  }
}

const cardAttribute = defineEnum([
  "DARK",
  "DIVINE",
  "EARTH",
  "FIRE",
  "LIGHT",
  "WATER",
  "WIND",
])

export const cardAttributeSchema = cardAttribute.schema
export type CardAttribute = z.infer<typeof cardAttributeSchema>
export const cardAttributeArray: CardAttribute[] = cardAttribute.array

export type CardBanlist = "tcg" | "ocg" | "goat"

export type CardFormat =
  | "tcg"
  | "goat"
  | "ocg goat"
  | "speed duel"
  | "master duel"
  | "rush duel"
  | "duel links"
  | "genesys"
  | "genesys ocg"

const cardSort = defineEnum([
  "atk",
  "def",
  "name",
  "type",
  "level",
  "id",
  "new",
])

export type CardSort = z.infer<typeof cardSort.schema>
export const cardSortArray: CardSort[] = cardSort.array

export type CardLanguage = "fr" | "de" | "it" | "pt"

export type CardDateRegion = "tcg" | "ocg"

const numericComparisonOperator = defineEnum(["lt", "lte", "gt", "gte"])

export type NumericComparisonOperator = z.infer<
  typeof numericComparisonOperator.schema
>
export const numericComparisonOperatorArray: NumericComparisonOperator[] =
  numericComparisonOperator.array

const cardLinkMarker = defineEnum([
  "Top",
  "Bottom",
  "Left",
  "Right",
  "Top-Left",
  "Top-Right",
  "Bottom-Left",
  "Bottom-Right",
])

const cardLinkMarkerSchema = cardLinkMarker.schema
export type CardLinkMarker = z.infer<typeof cardLinkMarkerSchema>

const cardBanlistStatus = defineEnum(["Forbidden", "Limited", "Semi-Limited"])

const cardBanlistStatusSchema = cardBanlistStatus.schema

export type NumericComparison = {
  operator: NumericComparisonOperator
  value: number
}

const binaryFlagSchema = z.literal([0, 1])

const cardSetSchema = z.object({
  set_name: z.string(),
  set_code: z.string(),
  set_rarity: z.string(),
  set_rarity_code: z.string(),
  set_price: z.string(),
})

const cardImageSchema = z.object({
  id: z.coerce.number(),
  image_url: z.string(),
  image_url_small: z.string(),
  image_url_cropped: z.string().optional(),
})

const cardPriceSchema = z.object({
  cardmarket_price: z.string(),
  tcgplayer_price: z.string(),
  ebay_price: z.string(),
  amazon_price: z.string(),
  coolstuffinc_price: z.string(),
})

const cardBanlistInfoSchema = z.object({
  ban_tcg: cardBanlistStatusSchema.optional(),
  ban_ocg: cardBanlistStatusSchema.optional(),
  ban_goat: cardBanlistStatusSchema.optional(),
})

const cardMiscInfoSchema = z.object({
  beta_name: z.string().optional(),
  beta_id: z.coerce.number().optional(),
  staple: z.string().optional(),
  views: z.coerce.number(),
  viewsweek: z.coerce.number(),
  upvotes: z.coerce.number(),
  downvotes: z.coerce.number(),
  formats: z.array(z.string()),
  treated_as: z.string().optional(),
  tcg_date: z.string().optional(),
  ocg_date: z.string().optional(),
  konami_id: z.coerce.number().optional(),
  md_rarity: z.string().optional(),
  has_effect: binaryFlagSchema,
  question_atk: binaryFlagSchema.optional(),
  question_def: binaryFlagSchema.optional(),
  genesys_points: z.coerce.number().optional(),
  genesys_ocg_points: z.coerce.number().optional(),
})

export const cardSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  type: z.string().nullable(),
  humanReadableCardType: z.string(),
  frameType: z.string(),
  desc: z.string(),
  pend_desc: z.string().optional(),
  monster_desc: z.string().optional(),
  race: z.string().optional(),
  archetype: z.string().optional(),
  attribute: cardAttributeSchema.optional(),
  atk: z.coerce.number().optional(),
  def: z.coerce.number().nullable().optional(),
  level: z.coerce.number().optional(),
  scale: z.coerce.number().optional(),
  linkval: z.coerce.number().optional(),
  linkmarkers: z.array(cardLinkMarkerSchema).optional(),
  typeline: z.array(z.string()).optional(),
  ygoprodeck_url: z.string(),
  banlist_info: cardBanlistInfoSchema.optional(),
  card_sets: z.array(cardSetSchema).optional(),
  card_images: z.array(cardImageSchema),
  card_prices: z.array(cardPriceSchema),
  misc_info: z.array(cardMiscInfoSchema).optional(),
})

export type Card = z.infer<typeof cardSchema>
