import { describe, expect, it } from "@effect/vitest"
import { toFtsMatch } from "../src/index.ts"

describe("toFtsMatch", () => {
  it("quotes every term and uses prefix matching for longer terms", () => {
    expect(toFtsMatch("my salary")).toBe('"my" OR "salary"*')
  })

  it("neutralises FTS syntax", () => {
    expect(toFtsMatch('a" OR * NEAR(b')).toBe('"or" OR "near"*')
  })

  it("returns undefined when nothing is searchable", () => {
    expect(toFtsMatch(" ?! ")).toBeUndefined()
  })
})
