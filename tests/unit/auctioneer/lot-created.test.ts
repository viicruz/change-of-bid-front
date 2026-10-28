//* Libraries imports
import { describe, expect, it } from "vitest"

//* Lib imports
import { createdLotStatus } from "@/src/lib/lots/created-lot"

//* Schema imports
import type { Lot } from "@/src/schemas/lot"

const now = new Date("2026-10-28T18:00:00.000Z").getTime()

function lotStartingAt(startsAt: string) {
  return { startsAt: new Date(startsAt) } as Lot
}

describe("createdLotStatus", () => {
  it("lists a lot that opens later as scheduled", () => {
    expect(
      createdLotStatus(lotStartingAt("2026-10-29T20:00:00.000Z"), now)
    ).toBe("SCHEDULED")
  })

  it("lists a lot whose start already passed as live", () => {
    expect(
      createdLotStatus(lotStartingAt("2026-10-28T17:00:00.000Z"), now)
    ).toBe("LIVE")
  })
})
