//* Libraries imports
import * as z from "zod"

function defineEnum<const T extends readonly [string, ...string[]]>(values: T) {
  const schema = z.enum(values)
  const enumObject = schema.enum
  const array = Object.values(enumObject) as Array<z.infer<typeof schema>>

  return {
    schema,
    enum: enumObject,
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
export const cardAttributeEnum = cardAttribute.enum
export const cardAttributeArray: CardAttribute[] = cardAttribute.array

const cardBanlist = defineEnum(["tcg", "ocg", "goat"])

export const cardBanlistSchema = cardBanlist.schema
export type CardBanlist = z.infer<typeof cardBanlistSchema>
export const cardBanlistEnum = cardBanlist.enum
export const cardBanlistArray: CardBanlist[] = cardBanlist.array

const cardFormat = defineEnum([
  "tcg",
  "goat",
  "ocg goat",
  "speed duel",
  "master duel",
  "rush duel",
  "duel links",
  "genesys",
  "genesys ocg",
])

export const cardFormatSchema = cardFormat.schema
export type CardFormat = z.infer<typeof cardFormatSchema>
export const cardFormatEnum = cardFormat.enum
export const cardFormatArray: CardFormat[] = cardFormat.array

const cardSort = defineEnum([
  "atk",
  "def",
  "name",
  "type",
  "level",
  "id",
  "new",
])

export const cardSortSchema = cardSort.schema
export type CardSort = z.infer<typeof cardSortSchema>
export const cardSortEnum = cardSort.enum
export const cardSortArray: CardSort[] = cardSort.array

const cardLanguage = defineEnum(["fr", "de", "it", "pt"])

export const cardLanguageSchema = cardLanguage.schema
export type CardLanguage = z.infer<typeof cardLanguageSchema>
export const cardLanguageEnum = cardLanguage.enum
export const cardLanguageArray: CardLanguage[] = cardLanguage.array

const cardDateRegion = defineEnum(["tcg", "ocg"])

export const cardDateRegionSchema = cardDateRegion.schema
export type CardDateRegion = z.infer<typeof cardDateRegionSchema>
export const cardDateRegionEnum = cardDateRegion.enum
export const cardDateRegionArray: CardDateRegion[] = cardDateRegion.array

const numericComparisonOperator = defineEnum(["lt", "lte", "gt", "gte"])

export const numericComparisonOperatorSchema = numericComparisonOperator.schema
export type NumericComparisonOperator = z.infer<
  typeof numericComparisonOperatorSchema
>
export const numericComparisonOperatorEnum = numericComparisonOperator.enum
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

export const cardLinkMarkerSchema = cardLinkMarker.schema
export type CardLinkMarker = z.infer<typeof cardLinkMarkerSchema>
export const cardLinkMarkerEnum = cardLinkMarker.enum
export const cardLinkMarkerArray: CardLinkMarker[] = cardLinkMarker.array

const cardBanlistStatus = defineEnum(["Forbidden", "Limited", "Semi-Limited"])

export const cardBanlistStatusSchema = cardBanlistStatus.schema
export type CardBanlistStatus = z.infer<typeof cardBanlistStatusSchema>
export const cardBanlistStatusEnum = cardBanlistStatus.enum
export const cardBanlistStatusArray: CardBanlistStatus[] =
  cardBanlistStatus.array

export const numericComparisonSchema = z.object({
  operator: numericComparisonOperatorSchema,
  value: z.number(),
})

export type NumericComparison = z.infer<typeof numericComparisonSchema>

const binaryFlagSchema = z.literal([0, 1])

const cardSetSchema = z.object({
  set_name: z.string(),
  set_code: z.string(),
  set_rarity: z.string(),
  set_rarity_code: z.string(),
  set_price: z.string(),
})

export type CardSet = z.infer<typeof cardSetSchema>

const cardImageSchema = z.object({
  id: z.number(),
  image_url: z.string(),
  image_url_small: z.string(),
  image_url_cropped: z.string().optional(),
})

export type CardImage = z.infer<typeof cardImageSchema>

const cardPriceSchema = z.object({
  cardmarket_price: z.string(),
  tcgplayer_price: z.string(),
  ebay_price: z.string(),
  amazon_price: z.string(),
  coolstuffinc_price: z.string(),
})

export type CardPrice = z.infer<typeof cardPriceSchema>

const cardBanlistInfoSchema = z.object({
  ban_tcg: cardBanlistStatusSchema.optional(),
  ban_ocg: cardBanlistStatusSchema.optional(),
  ban_goat: cardBanlistStatusSchema.optional(),
})

export type CardBanlistInfo = z.infer<typeof cardBanlistInfoSchema>

const cardMiscInfoSchema = z.object({
  beta_name: z.string().optional(),
  beta_id: z.number().optional(),
  staple: z.string().optional(),
  views: z.number(),
  viewsweek: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  formats: z.array(z.string()),
  treated_as: z.string().optional(),
  tcg_date: z.string().optional(),
  ocg_date: z.string().optional(),
  konami_id: z.number().optional(),
  md_rarity: z.string().optional(),
  has_effect: binaryFlagSchema,
  question_atk: binaryFlagSchema.optional(),
  question_def: binaryFlagSchema.optional(),
  genesys_points: z.number().optional(),
  genesys_ocg_points: z.number().optional(),
})

export type CardMiscInfo = z.infer<typeof cardMiscInfoSchema>

export const cardSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  humanReadableCardType: z.string(),
  frameType: z.string(),
  desc: z.string(),
  pend_desc: z.string().optional(),
  monster_desc: z.string().optional(),
  race: z.string().optional(),
  archetype: z.string().optional(),
  attribute: cardAttributeSchema.optional(),
  atk: z.number().optional(),
  def: z.number().nullable().optional(),
  level: z.number().optional(),
  scale: z.number().optional(),
  linkval: z.number().optional(),
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
