//* Libraries imports
import { describe, expect, it } from "vitest"

//* Local imports
import { ApiError } from "@/src/lib/api"
import {
  bidErrorMessageKey,
  centsToMoney,
  isBidErrorCode,
  minimumBidCents,
  moneyToCents,
  moneyToNumber,
  readBidErrorCode,
} from "@/src/lib/auction/bid-money"

describe("bid money", () => {
  it("reads a money string as a number", () => {
    expect(moneyToNumber("12.50")).toBe(12.5)
    expect(moneyToNumber("0.00")).toBe(0)
  })

  it("converts money to whole cents without float noise", () => {
    expect(moneyToCents("10.00")).toBe(1000)
    expect(moneyToCents("0.29")).toBe(29)
    expect(moneyToCents("19.99")).toBe(1999)
  })

  it("converts cents back to a two-decimal money string", () => {
    expect(centsToMoney(1000)).toBe("10.00")
    expect(centsToMoney(29)).toBe("0.29")
    expect(centsToMoney(1234)).toBe("12.34")
  })

  it("round-trips money through cents", () => {
    expect(centsToMoney(moneyToCents("0.10") + moneyToCents("0.20"))).toBe(
      "0.30"
    )
  })

  it("uses the opening bid as the minimum when nobody has bid", () => {
    expect(
      minimumBidCents({
        openingBid: "10.00",
        currentBid: null,
        minIncrement: "1.50",
      })
    ).toBe(1000)
  })

  it("adds the increment to the current bid once there is one", () => {
    expect(
      minimumBidCents({
        openingBid: "10.00",
        currentBid: "12.30",
        minIncrement: "1.50",
      })
    ).toBe(1380)
  })
})

describe("bid error codes", () => {
  it("knows every code that has a message", () => {
    for (const code of Object.keys(bidErrorMessageKey)) {
      expect(isBidErrorCode(code)).toBe(true)
    }

    expect(isBidErrorCode("SOMETHING_ELSE")).toBe(false)
  })

  it("reads a known code from an API error body", () => {
    const error = new ApiError(422, "Unprocessable", {
      code: "BID_BELOW_MINIMUM",
    })

    expect(readBidErrorCode(error)).toBe("BID_BELOW_MINIMUM")
  })

  it("ignores unknown codes and malformed bodies", () => {
    expect(
      readBidErrorCode(new ApiError(422, "Unprocessable", { code: "NOPE" }))
    ).toBeNull()
    expect(
      readBidErrorCode(new ApiError(422, "Unprocessable", { code: 42 }))
    ).toBeNull()
    expect(readBidErrorCode(new ApiError(500, "Server", null))).toBeNull()
    expect(readBidErrorCode(new ApiError(500, "Server", "boom"))).toBeNull()
  })

  it("ignores errors that are not API errors", () => {
    expect(readBidErrorCode(new Error("BID_BELOW_MINIMUM"))).toBeNull()
    expect(readBidErrorCode({ body: { code: "LOT_ENDED" } })).toBeNull()
  })
})
