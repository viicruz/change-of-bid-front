//* Libraries imports
import { describe, expect, it } from "vitest"

//* Schema imports
import { walletMovementsSchema, walletSchema } from "@/src/schemas/wallet"

const wallet = {
  totalBalance: "10.10",
  committedBalance: "0.01",
  availableBalance: "10.09",
}

describe("walletSchema", () => {
  it("keeps the documented balances as money strings", () => {
    const parsed = walletSchema.parse(wallet)

    expect(parsed).toEqual(wallet)
  })

  it("accepts a new account that starts at zero", () => {
    const parsed = walletSchema.parse({
      totalBalance: "0.00",
      committedBalance: "0.00",
      availableBalance: "0.00",
    })

    expect(parsed.totalBalance).toBe("0.00")
    expect(parsed.committedBalance).toBe("0.00")
    expect(parsed.availableBalance).toBe("0.00")
  })

  it("rejects a balance that is a number", () => {
    const result = walletSchema.safeParse({
      ...wallet,
      totalBalance: 10.1,
    })

    expect(result.success).toBe(false)
  })

  it("rejects a balance that does not have exactly two fraction digits", () => {
    for (const totalBalance of ["10", "10.1", "10.100", "8", ".50"]) {
      const result = walletSchema.safeParse({
        ...wallet,
        totalBalance,
      })

      expect(result.success).toBe(false)
    }
  })
})

const movementId = "6f1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e5f"
const lotId = "11111111-1111-4111-8111-111111111111"
const bidId = "22222222-2222-4222-8222-222222222222"
const createdAt = "2026-04-02T00:00:00.000Z"

function movement(type: string, lot: string | null, bid: string | null) {
  return {
    id: movementId,
    type,
    amount: "2.00",
    lotId: lot,
    bidId: bid,
    createdAt,
  }
}

describe("walletMovementsSchema", () => {
  it("keeps each documented movement type and the page envelope", () => {
    const parsed = walletMovementsSchema.parse({
      movements: [
        movement("DEPOSIT", null, null),
        movement("HOLD", lotId, bidId),
        movement("RELEASE", lotId, bidId),
        movement("SETTLEMENT_DEBIT", lotId, null),
        movement("SETTLEMENT_CREDIT", lotId, null),
      ],
      page: 1,
      limit: 20,
      total: 5,
    })

    expect(parsed.movements.map((item) => item.type)).toEqual([
      "DEPOSIT",
      "HOLD",
      "RELEASE",
      "SETTLEMENT_DEBIT",
      "SETTLEMENT_CREDIT",
    ])
    expect(parsed.movements[0]?.amount).toBe("2.00")
    expect(parsed.movements[0]?.createdAt).toBe(createdAt)
    expect(parsed.page).toBe(1)
    expect(parsed.limit).toBe(20)
    expect(parsed.total).toBe(5)
  })

  it("accepts an empty page past the last movement", () => {
    const parsed = walletMovementsSchema.parse({
      movements: [],
      page: 2,
      limit: 20,
      total: 5,
    })

    expect(parsed.movements).toEqual([])
    expect(parsed.total).toBe(5)
  })

  it("rejects a deposit that references a lot or a bid", () => {
    const result = walletMovementsSchema.safeParse({
      movements: [movement("DEPOSIT", lotId, null)],
      page: 1,
      limit: 20,
      total: 1,
    })

    expect(result.success).toBe(false)
  })

  it("rejects a hold that is missing its bid", () => {
    const result = walletMovementsSchema.safeParse({
      movements: [movement("HOLD", lotId, null)],
      page: 1,
      limit: 20,
      total: 1,
    })

    expect(result.success).toBe(false)
  })

  it("rejects a settlement debit that includes a bid", () => {
    const result = walletMovementsSchema.safeParse({
      movements: [movement("SETTLEMENT_DEBIT", lotId, bidId)],
      page: 1,
      limit: 20,
      total: 1,
    })

    expect(result.success).toBe(false)
  })

  it("rejects an amount that is not a two-decimal money string", () => {
    for (const amount of ["2", "2.0", "2.000", -2, "-2.00"]) {
      const result = walletMovementsSchema.safeParse({
        movements: [
          {
            ...movement("DEPOSIT", null, null),
            amount,
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      })

      expect(result.success).toBe(false)
    }
  })

  it("rejects a page or limit outside the documented range", () => {
    for (const page of [0, 1001, 1.5]) {
      const result = walletMovementsSchema.safeParse({
        movements: [],
        page,
        limit: 20,
        total: 0,
      })

      expect(result.success).toBe(false)
    }

    const limit = walletMovementsSchema.safeParse({
      movements: [],
      page: 1,
      limit: 51,
      total: 0,
    })

    expect(limit.success).toBe(false)
  })
})
