//* Libraries imports
import { describe, expect, it } from "vitest"

//* Schema imports
import { walletSchema } from "@/src/schemas/wallet"

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
