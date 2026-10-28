//* Libraries imports
import { describe, expect, it } from "vitest"

//* Lib imports
import {
  defaultLotStart,
  durationBetween,
  lotDuration,
  parseDateTimeLocal,
  scheduleForDuration,
  toDateTimeLocal,
} from "@/src/lib/lots/lot-schedule"

const now = new Date(2026, 9, 28, 15, 42)

describe("lot schedule", () => {
  it("round-trips a datetime-local value", () => {
    const date = new Date(2026, 0, 5, 8, 3)

    expect(toDateTimeLocal(date)).toBe("2026-01-05T08:03")
    expect(parseDateTimeLocal("2026-01-05T08:03")).toEqual(date)
  })

  it("does not parse an empty or malformed value", () => {
    expect(parseDateTimeLocal("")).toBeNull()
    expect(parseDateTimeLocal("05/01/2026 08:03")).toBeNull()
  })

  it("starts by default tomorrow at 20:00", () => {
    expect(toDateTimeLocal(defaultLotStart(now))).toBe("2026-10-29T20:00")
  })

  it("ends a duration after the chosen start", () => {
    expect(
      scheduleForDuration({ startsAt: "2026-11-02T18:30", days: 3, now })
    ).toEqual({
      startsAt: "2026-11-02T18:30",
      endsAt: "2026-11-05T18:30",
    })
  })

  it("fills the default start when there is none", () => {
    expect(scheduleForDuration({ startsAt: "", days: 1, now })).toEqual({
      startsAt: "2026-10-29T20:00",
      endsAt: "2026-10-30T20:00",
    })
  })

  it("splits the duration into days, hours and minutes", () => {
    expect(lotDuration("2026-10-29T20:00", "2026-11-01T22:15")).toEqual({
      days: 3,
      hours: 2,
      minutes: 15,
    })
  })

  it("has no duration when the end is not after the start", () => {
    expect(lotDuration("2026-10-29T20:00", "2026-10-29T20:00")).toBeNull()
    expect(lotDuration("", "2026-10-29T20:00")).toBeNull()
  })

  it("measures the duration between two dates", () => {
    expect(
      durationBetween(
        new Date("2099-10-26T21:00:00.000Z"),
        new Date("2099-10-28T21:30:00.000Z")
      )
    ).toEqual({ days: 2, hours: 0, minutes: 30 })
  })
})
