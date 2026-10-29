//* Libraries imports
import { describe, expect, it } from "vitest"
import * as z from "zod"

//* Local imports
import {
  createLotFormSchema,
  toStoreLot,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"

function validForm(
  overrides: Partial<CreateLotFormValues> = {}
): CreateLotFormValues {
  return {
    title: "  Blue-Eyes lot  ",
    description: "  Optional text  ",
    openingBid: "10.00",
    minIncrement: "0.50",
    startsAt: "2099-10-26T18:00",
    endsAt: "2099-10-28T18:00",
    cards: [
      {
        cardId: 89631139,
        name: "Blue-Eyes White Dragon",
        cardType: "monster",
        attribute: "LIGHT",
        imageUrl:
          "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
      },
    ],
    ...overrides,
  }
}

function issueMessages(error: z.ZodError, path: string) {
  return error.issues
    .filter((issue) => issue.path.join(".") === path)
    .map((issue) => issue.message)
}

describe("createLotFormSchema", () => {
  it("accepts a lot that satisfies the store payload", () => {
    const result = createLotFormSchema.safeParse(validForm())

    expect(result.success).toBe(true)
  })

  it("rejects a lot without cards", () => {
    const result = createLotFormSchema.safeParse(validForm({ cards: [] }))

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(issueMessages(result.error, "cards")).toContain("CARD_IDS_REQUIRED")
  })

  it("rejects a schedule shorter than 4 minutes", () => {
    const result = createLotFormSchema.safeParse(
      validForm({ endsAt: "2099-10-26T18:03" })
    )

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(issueMessages(result.error, "endsAt")).toContain("INVALID_SCHEDULE")
  })

  it("asks for the dates when they are empty", () => {
    const result = createLotFormSchema.safeParse(
      validForm({ startsAt: "", endsAt: "" })
    )

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(issueMessages(result.error, "startsAt")).toEqual([
      "LOT_STARTS_AT_REQUIRED",
    ])
    expect(issueMessages(result.error, "endsAt")).toEqual([
      "LOT_ENDS_AT_REQUIRED",
    ])
  })
})

describe("toStoreLot", () => {
  it("converts datetime-local values to offset ISO strings and card ids", () => {
    const payload = toStoreLot(validForm())

    expect(payload).toEqual({
      title: "Blue-Eyes lot",
      description: "Optional text",
      openingBid: "10.00",
      minIncrement: "0.50",
      startsAt: new Date("2099-10-26T18:00").toISOString(),
      endsAt: new Date("2099-10-28T18:00").toISOString(),
      cardIds: [89631139],
    })
  })
})
