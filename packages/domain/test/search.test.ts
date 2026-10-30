import { describe, expect, it } from "@effect/vitest"
import { searchTerms } from "../src/index.ts"

describe("searchTerms", () => {
  it("extracts lower-cased unique word terms and drops punctuation and 1-char tokens", () => {
    expect(searchTerms('My salary, my "SALARY" a NEAR(x)!')).toEqual(["my", "salary", "near"])
  })

  it("keeps Ethiopic words", () => {
    expect(searchTerms("ደሞዜ አልተከፈለኝም።")).toEqual(["ደሞዜ", "አልተከፈለኝም"])
  })

  it("returns nothing for blank input", () => {
    expect(searchTerms("   ")).toEqual([])
  })
})
