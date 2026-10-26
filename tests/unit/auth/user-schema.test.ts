//* Libraries imports
import { describe, expect, it } from "vitest"

//* Schema imports
import { authUserSchema, userRoleSchema } from "@/src/schemas/user"

const createdAt = new Date("2026-10-26T21:17:38.860Z")
const updatedAt = new Date("2026-10-26T21:17:38.860Z")

function authUser(role: string) {
  return {
    id: "OWYirXFpC4l38XONIWLZMTSqNDLxOaUk",
    name: "Auctioneer",
    email: "auctioneer@auctioneer.auctioneer",
    emailVerified: true,
    image: null,
    createdAt,
    updatedAt,
    role,
  }
}

describe("userRoleSchema", () => {
  it("accepts an auctioneer", () => {
    expect(userRoleSchema.parse("AUCTIONEER")).toBe("AUCTIONEER")
  })

  it("accepts a bidder", () => {
    expect(userRoleSchema.parse("BIDDER")).toBe("BIDDER")
  })

  it("rejects an unknown role", () => {
    expect(userRoleSchema.safeParse("ADMIN").success).toBe(false)
  })
})

describe("authUserSchema", () => {
  it("parses a user with an auctioneer role", () => {
    const user = authUserSchema.parse(authUser("AUCTIONEER"))

    expect(user.role).toBe("AUCTIONEER")
  })

  it("parses a user with a bidder role", () => {
    const user = authUserSchema.parse(authUser("BIDDER"))

    expect(user.role).toBe("BIDDER")
  })

  it("rejects a user without a valid role", () => {
    expect(authUserSchema.safeParse(authUser("ADMIN")).success).toBe(false)
    expect(
      authUserSchema.safeParse({ ...authUser("BIDDER"), role: undefined })
        .success
    ).toBe(false)
  })
})
