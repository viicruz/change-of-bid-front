//* Libraries imports
import { describe, expect, it } from "vitest"

//* Script imports
import { compareStructure } from "@/scripts/check-messages-parity"

describe("compareStructure", () => {
  it("accepts catalogs whose string values differ", () => {
    const mismatches = compareStructure(
      { title: "Hello", items: ["a"] },
      { title: "Olá", items: ["b"] }
    )

    expect(mismatches).toEqual([])
  })

  it("reports a key that is missing from the candidate", () => {
    const mismatches = compareStructure({ title: "Hello" }, {})

    expect(mismatches).toEqual([{ path: "title", reason: "missing key" }])
  })

  it("reports a key that is not in the source", () => {
    const mismatches = compareStructure({}, { extra: "value" })

    expect(mismatches).toEqual([{ path: "extra", reason: "unexpected key" }])
  })

  it("reports a leaf whose type differs", () => {
    const mismatches = compareStructure({ count: "1" }, { count: 1 })

    expect(mismatches).toEqual([
      {
        path: "count",
        reason: "expected string but received number",
      },
    ])
  })

  it("reports an array whose length differs", () => {
    const mismatches = compareStructure({ items: ["a"] }, { items: ["a", "b"] })

    expect(mismatches).toEqual([
      {
        path: "items",
        reason: "expected array length 1 but received 2",
      },
    ])
  })
})
