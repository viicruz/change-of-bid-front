//* Libraries imports
import { describe, expect, it } from "vitest"

//* Schema imports
import { cardSchema } from "@/src/schemas/card"
import { apiResponseErrorSchema } from "@/src/schemas/common/api"

//* Local imports
import {
  buildCardSearchParams,
  cardSearchQueryKey,
  isEmptyCardSearchError,
  shouldKeepCardSearchPage,
} from "@/src/hooks/cards/queries/use-index-cards"
import {
  getCardSearchPageCount,
  getCardSearchPageItems,
} from "@/src/lib/cards/card-search-pages"
import { ApiError } from "@/src/lib/api"

const blueEyesWhiteDragon = {
  id: 89631139,
  name: "Blue-Eyes White Dragon",
  type: "Normal Monster",
  humanReadableCardType: "Normal Monster",
  frameType: "normal",
  desc: "This legendary dragon is a powerful engine of destruction.",
  race: "Dragon",
  archetype: "Blue-Eyes",
  attribute: "LIGHT",
  atk: 3000,
  def: 2500,
  level: 8,
  typeline: ["Dragon", "Normal"],
  ygoprodeck_url: "https://ygoprodeck.com/card/blue-eyes-white-dragon-4007",
  card_sets: [
    {
      set_name: "Legend of Blue Eyes White Dragon",
      set_code: "LOB-001",
      set_rarity: "Ultra Rare",
      set_rarity_code: "(UR)",
      set_price: "35.2",
    },
  ],
  card_images: [
    {
      id: 89631139,
      image_url: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
      image_url_small:
        "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
      image_url_cropped:
        "https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg",
    },
  ],
  card_prices: [
    {
      cardmarket_price: "0.18",
      tcgplayer_price: "0.42",
      ebay_price: "2.95",
      amazon_price: "1.48",
      coolstuffinc_price: "0.99",
    },
  ],
}

describe("cardSchema", () => {
  it("parses a monster with sets, images, and prices", () => {
    const parsed = cardSchema.parse(blueEyesWhiteDragon)

    expect(parsed.name).toBe("Blue-Eyes White Dragon")
    expect(parsed.atk).toBe(3000)
    expect(parsed.card_sets?.[0]).toEqual(
      expect.objectContaining({ set_code: "LOB-001" })
    )
    expect(parsed.card_images[0]).toEqual(
      expect.objectContaining({
        image_url_cropped:
          "https://images.ygoprodeck.com/images/cards_cropped/89631139.jpg",
      })
    )
  })

  it("parses a link monster whose defense is null", () => {
    const parsed = cardSchema.parse({
      id: 1861629,
      name: "Decode Talker",
      type: "Link Monster",
      humanReadableCardType: "Link Monster",
      frameType: "link",
      desc: "A link monster.",
      race: "Cyberse",
      attribute: "DARK",
      atk: 2300,
      def: null,
      linkval: 3,
      linkmarkers: ["Top", "Bottom-Left", "Bottom-Right"],
      ygoprodeck_url: "https://ygoprodeck.com/card/decode-talker",
      card_images: [
        {
          id: 1861629,
          image_url: "https://images.ygoprodeck.com/images/cards/1861629.jpg",
          image_url_small:
            "https://images.ygoprodeck.com/images/cards_small/1861629.jpg",
        },
      ],
      card_prices: [
        {
          cardmarket_price: "0",
          tcgplayer_price: "0",
          ebay_price: "0",
          amazon_price: "0",
          coolstuffinc_price: "0",
        },
      ],
    })

    expect(parsed.def).toBeNull()
    expect(parsed.linkmarkers).toEqual(["Top", "Bottom-Left", "Bottom-Right"])
  })
})

describe("apiResponseErrorSchema", () => {
  it("keeps the validation message from a rejected query", () => {
    const parsed = apiResponseErrorSchema.parse({
      type: "validation",
      on: "query",
      property: "sort",
      message:
        'Invalid option: expected one of "atk"|"def"|"name"|"type"|"level"|"id"|"new"',
      found: { sort: "price" },
      errors: [],
    })

    expect(parsed.property).toBe("sort")
    expect(parsed.message).toBe(
      'Invalid option: expected one of "atk"|"def"|"name"|"type"|"level"|"id"|"new"'
    )
    expect(parsed.found).toEqual({ sort: "price" })
    expect(parsed.errors).toEqual([])
  })
})

describe("buildCardSearchParams", () => {
  it("encodes the documented search filters", () => {
    const params = buildCardSearchParams({
      fname: "Dragon",
      attribute: ["LIGHT", "DARK"],
      type: "Effect Monster",
      atk: { operator: "gte", value: 2500 },
      format: "tcg",
      sort: "atk",
    })

    expect(params).toEqual({
      fname: "Dragon",
      attribute: "LIGHT,DARK",
      type: "Effect Monster",
      atk: '{"operator":"gte","value":2500}',
      format: "tcg",
      sort: "atk",
    })

    const query = new URLSearchParams(params)

    expect(query.get("atk")).toBe('{"operator":"gte","value":2500}')
    expect(query.toString()).toContain(
      "atk=%7B%22operator%22%3A%22gte%22%2C%22value%22%3A2500%7D"
    )
    expect(query.toString()).not.toContain("%257B")
  })

  it("encodes a name that contains a comma as a JSON array", () => {
    const params = buildCardSearchParams({
      name: "Dark Magician, the Magician of Black Chaos",
    })

    expect(params.name).toBe('["Dark Magician, the Magician of Black Chaos"]')
  })

  it("encodes one or more card ids as a JSON array of numbers", () => {
    expect(buildCardSearchParams({ id: [46986414] }).id).toBe("[46986414]")
    expect(buildCardSearchParams({ id: [46986414, 89631139] }).id).toBe(
      "[46986414,89631139]"
    )
  })

  it("rejects name and id together", () => {
    expect(() =>
      buildCardSearchParams({
        name: "Dark Magician",
        id: [46986414],
      })
    ).toThrow(/name and id cannot be used together/)
  })

  it("encodes num and offset, including a zero offset", () => {
    expect(
      buildCardSearchParams(
        { fname: "Dragon" },
        {
          num: 4,
          offset: 0,
        }
      )
    ).toEqual({
      fname: "Dragon",
      num: "4",
      offset: "0",
    })
  })

  it("rejects a pagination count that is not a non-negative integer", () => {
    expect(() =>
      buildCardSearchParams({ fname: "Dragon" }, { num: 1.5, offset: 0 })
    ).toThrow(/num must be a non-negative integer/)
    expect(() =>
      buildCardSearchParams({ fname: "Dragon" }, { num: 4, offset: -1 })
    ).toThrow(/offset must be a non-negative integer/)
  })
})

describe("card search pages", () => {
  it("counts pages from the total number of cards", () => {
    expect(getCardSearchPageCount(0, 4)).toBe(0)
    expect(getCardSearchPageCount(4, 4)).toBe(1)
    expect(getCardSearchPageCount(5, 4)).toBe(2)
  })

  it("lists every page when there are only a few", () => {
    expect(getCardSearchPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it("collapses distant pages into ellipses", () => {
    expect(getCardSearchPageItems(1, 12)).toEqual([1, 2, "ellipsis", 12])
    expect(getCardSearchPageItems(6, 12)).toEqual([
      1,
      "ellipsis",
      6,
      "ellipsis",
      12,
    ])
    expect(getCardSearchPageItems(12, 12)).toEqual([1, "ellipsis", 11, 12])
  })
})

describe("shouldKeepCardSearchPage", () => {
  it("keeps the previous page while only the offset changes", () => {
    const previousKey = cardSearchQueryKey(
      { fname: "Dragon" },
      { num: 4, offset: 0 }
    )
    const nextKey = cardSearchQueryKey(
      { fname: "Dragon" },
      { num: 4, offset: 4 }
    )

    expect(shouldKeepCardSearchPage(previousKey, nextKey)).toBe(true)
  })

  it("drops the previous page when the filters or page size change", () => {
    const previousKey = cardSearchQueryKey(
      { fname: "Dragon" },
      { num: 4, offset: 0 }
    )

    expect(
      shouldKeepCardSearchPage(
        previousKey,
        cardSearchQueryKey({ fname: "Magician" }, { num: 4, offset: 0 })
      )
    ).toBe(false)
    expect(
      shouldKeepCardSearchPage(
        previousKey,
        cardSearchQueryKey({ fname: "Dragon" }, { num: 8, offset: 0 })
      )
    ).toBe(false)
  })
})

describe("isEmptyCardSearchError", () => {
  it("matches the plain-text response for no matching cards", () => {
    const error = new ApiError(
      500,
      "No card matching your query was found in the database.",
      "No card matching your query was found in the database."
    )

    expect(isEmptyCardSearchError(error)).toBe(true)
  })

  it("matches the longer plain-text response for no matching cards", () => {
    const message =
      "No card matching your query was found in the database. Please see https://db.ygoprodeck.com/api-guide/ for syntax usage."
    const error = new ApiError(500, message, message)

    expect(isEmptyCardSearchError(error)).toBe(true)
  })

  it("ignores other server failures", () => {
    expect(
      isEmptyCardSearchError(
        new ApiError(500, "Internal Server Error", "Internal Server Error")
      )
    ).toBe(false)
    expect(
      isEmptyCardSearchError(
        new ApiError(422, "Invalid option", { message: "Invalid option" })
      )
    ).toBe(false)
  })
})
