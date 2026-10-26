//* Libraries imports
import { describe, expect, it } from "vitest"
import * as z from "zod"

//* Schema imports
import { lotSchema, lotStatusEnum } from "@/src/schemas/lot"

//* Hooks imports
import {
  storeLotSchema,
  type StoreLot,
} from "@/src/hooks/lots/mutations/use-store-lot"

const createdLot = {
  id: "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e6f",
  auctioneerId: "user-id",
  title: "Blue-Eyes lot",
  description: null,
  openingBid: "10.00",
  minIncrement: "0.50",
  startsAt: "2026-10-26T18:00:00.000Z",
  originalEndsAt: "2026-10-27T18:00:00.000Z",
  endsAt: "2026-10-27T18:00:00.000Z",
  status: "ACTIVE",
  items: [
    {
      id: "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e70",
      position: 1,
      cardId: 89631139,
      quantity: 1,
      cardName: "Blue-Eyes White Dragon",
      imagePath: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
    },
  ],
}

function validStoreLot(overrides: Partial<StoreLot> = {}): StoreLot {
  return {
    title: "Blue-Eyes lot",
    description: "Optional text",
    openingBid: "10.00",
    minIncrement: "0.50",
    startsAt: "2099-10-26T18:00:00.000Z",
    endsAt: "2099-10-27T18:00:00.000Z",
    cardIds: [89631139, 46986414],
    ...overrides,
  }
}

function issueMessages(error: z.ZodError, path: string) {
  return error.issues
    .filter((issue) => issue.path.join(".") === path)
    .map((issue) => issue.message)
}

describe("lotSchema", () => {
  it("parses a created lot and coerces schedule instants to dates", () => {
    const parsed = lotSchema.parse(createdLot)

    expect(parsed.status).toBe(lotStatusEnum.ACTIVE)
    expect(parsed.openingBid).toBe("10.00")
    expect(parsed.minIncrement).toBe("0.50")
    expect(parsed.startsAt).toEqual(new Date("2026-10-26T18:00:00.000Z"))
    expect(parsed.originalEndsAt).toEqual(new Date("2026-10-27T18:00:00.000Z"))
    expect(parsed.endsAt).toEqual(new Date("2026-10-27T18:00:00.000Z"))
    expect(parsed.items[0]).toEqual(
      expect.objectContaining({
        position: 1,
        cardId: 89631139,
        quantity: 1,
      })
    )
  })

  it("rejects response money that is not a positive two-decimal string", () => {
    const result = lotSchema.safeParse({
      ...createdLot,
      openingBid: "10",
    })

    expect(result.success).toBe(false)
  })
})

describe("storeLotSchema", () => {
  it("accepts a lot that lasts exactly 24 hours", () => {
    const parsed = storeLotSchema.parse(validStoreLot())

    expect(parsed.cardIds).toEqual([89631139, 46986414])
    expect(parsed.title).toBe("Blue-Eyes lot")
  })

  it("accepts money strings with a dot and at most two decimal places", () => {
    for (const amount of ["10", "10.5", "10.50", "0.01"]) {
      const parsed = storeLotSchema.parse(
        validStoreLot({ openingBid: amount, minIncrement: amount })
      )

      expect(parsed.openingBid).toBe(amount)
      expect(parsed.minIncrement).toBe(amount)
    }
  })

  it("accepts an offset other than Z and keeps duplicate card ids in order", () => {
    const parsed = storeLotSchema.parse(
      validStoreLot({
        startsAt: "2099-10-26T15:00:00-03:00",
        endsAt: "2099-10-27T15:00:00-03:00",
        cardIds: [89631139, 89631139],
        description: null,
      })
    )

    expect(parsed.cardIds).toEqual([89631139, 89631139])
    expect(parsed.description).toBeNull()
  })

  it("trims the title and treats a blank description as an empty string", () => {
    const parsed = storeLotSchema.parse(
      validStoreLot({
        title: "  Blue-Eyes lot  ",
        description: "   ",
      })
    )

    expect(parsed.title).toBe("Blue-Eyes lot")
    expect(parsed.description).toBe("")
  })

  it("rejects money that is zero, signed, comma-formatted, or too precise", () => {
    for (const amount of [
      "0",
      "0.00",
      "0.0",
      "-1",
      "1,50",
      "10.555",
      "01.00",
    ]) {
      const result = storeLotSchema.safeParse(
        validStoreLot({ openingBid: amount })
      )

      expect(result.success).toBe(false)

      if (!result.success) {
        expect(issueMessages(result.error, "openingBid")).toContain(
          "INVALID_MONEY"
        )
      }
    }
  })

  it("rejects a datetime that has no timezone offset", () => {
    const result = storeLotSchema.safeParse(
      validStoreLot({ startsAt: "2099-10-26T18:00:00" })
    )

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(issueMessages(result.error, "startsAt")).toContain(
        "INVALID_DATETIME"
      )
    }
  })

  it("rejects a lot that lasts less than 24 hours", () => {
    const result = storeLotSchema.safeParse(
      validStoreLot({ endsAt: "2099-10-27T17:00:00.000Z" })
    )

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(issueMessages(result.error, "endsAt")).toEqual([
        "INVALID_SCHEDULE",
      ])
    }
  })

  it("rejects an end that is not in the future", () => {
    const result = storeLotSchema.safeParse(
      validStoreLot({
        startsAt: "2020-10-26T18:00:00.000Z",
        endsAt: "2020-10-27T18:00:00.000Z",
      })
    )

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(issueMessages(result.error, "endsAt")).toEqual([
        "INVALID_SCHEDULE",
      ])
    }
  })

  it("rejects a blank title", () => {
    const result = storeLotSchema.safeParse(validStoreLot({ title: "   " }))

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(issueMessages(result.error, "title")).toContain("TITLE_REQUIRED")
    }
  })

  it("rejects an empty card list", () => {
    const result = storeLotSchema.safeParse(validStoreLot({ cardIds: [] }))

    expect(result.success).toBe(false)

    if (!result.success) {
      expect(issueMessages(result.error, "cardIds")).toContain(
        "CARD_IDS_REQUIRED"
      )
    }
  })
})
