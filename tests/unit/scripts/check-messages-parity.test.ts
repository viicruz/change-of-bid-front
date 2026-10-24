//* Node imports
import assert from "node:assert/strict"
import { describe, it } from "node:test"

//* Script imports
import { compareStructure } from "../../../scripts/check-messages-parity.ts"

describe("compareStructure", () => {
  it("accepts catalogs whose string values differ", () => {
    const mismatches = compareStructure(
      { title: "Hello", items: ["a"] },
      { title: "Olá", items: ["b"] }
    )

    assert.deepEqual(mismatches, [])
  })

  it("reports a key that is missing from the candidate", () => {
    const mismatches = compareStructure({ title: "Hello" }, {})

    assert.deepEqual(mismatches, [{ path: "title", reason: "missing key" }])
  })

  it("reports a key that is not in the source", () => {
    const mismatches = compareStructure({}, { extra: "value" })

    assert.deepEqual(mismatches, [{ path: "extra", reason: "unexpected key" }])
  })

  it("reports a leaf whose type differs", () => {
    const mismatches = compareStructure({ count: "1" }, { count: 1 })

    assert.deepEqual(mismatches, [
      {
        path: "count",
        reason: "expected string but received number",
      },
    ])
  })

  it("reports an array whose length differs", () => {
    const mismatches = compareStructure({ items: ["a"] }, { items: ["a", "b"] })

    assert.deepEqual(mismatches, [
      {
        path: "items",
        reason: "expected array length 1 but received 2",
      },
    ])
  })
})
