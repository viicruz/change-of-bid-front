//* Libraries imports
import { describe, expect, it } from "vitest"

//* Lib imports
import {
  applyCalendarDate,
  applyClockTime,
  dateTimeNotBefore,
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

  it("keeps the current time when a date is chosen", () => {
    expect(applyCalendarDate("2026-11-02T18:30", new Date(2099, 9, 26))).toBe(
      "2099-10-26T18:30"
    )
  })

  it("uses 20:00 when a date is chosen on an empty field", () => {
    expect(applyCalendarDate("", new Date(2099, 9, 26))).toBe(
      "2099-10-26T20:00"
    )
  })

  it("changes only the hours and minutes", () => {
    expect(applyClockTime("2099-10-26T20:00", "18:05")).toBe("2099-10-26T18:05")
  })

  it("leaves the value unchanged when the time has no date", () => {
    expect(applyClockTime("", "18:05")).toBe("")
  })

  it("leaves the value unchanged when the time is malformed", () => {
    expect(applyClockTime("2099-10-26T20:00", "8")).toBe("2099-10-26T20:00")
  })

  it("keeps a datetime that is already on or after the minimum", () => {
    expect(dateTimeNotBefore("2099-10-28T18:00", "2099-10-26T18:00")).toBe(
      "2099-10-28T18:00"
    )
    expect(dateTimeNotBefore("2099-10-26T18:00", "2099-10-26T18:00")).toBe(
      "2099-10-26T18:00"
    )
  })

  it("uses the minimum when the datetime is earlier", () => {
    expect(dateTimeNotBefore("2099-10-26T17:59", "2099-10-26T18:00")).toBe(
      "2099-10-26T18:00"
    )
  })

  it("keeps the value when there is no minimum", () => {
    expect(dateTimeNotBefore("2099-10-26T17:00", undefined)).toBe(
      "2099-10-26T17:00"
    )
  })

  it("starts a four minute lot at the current moment", () => {
    expect(scheduleForDuration({ minutes: 4, now })).toEqual({
      startsAt: "2026-10-28T15:42",
      endsAt: "2026-10-28T15:46",
    })
  })

  it("starts a multi-day lot at the current moment", () => {
    expect(scheduleForDuration({ days: 3, now })).toEqual({
      startsAt: "2026-10-28T15:42",
      endsAt: "2026-10-31T15:42",
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
