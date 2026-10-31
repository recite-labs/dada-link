import { describe, expect, it } from "@effect/vitest"
import { toFtsMatch } from "../src/index.ts"

describe("toFtsMatch", () => {
  it("quotes every term and uses prefix matching for longer terms", () => {
    expect(toFtsMatch("my rest day")).toBe('"my" OR "rest"* OR "day"*')
  })

  it("neutralises FTS syntax", () => {
    expect(toFtsMatch('a" OR * NEAR(b')).toBe('"or" OR "near"*')
  })

  it("returns undefined when nothing is searchable", () => {
    expect(toFtsMatch(" ?! ")).toBeUndefined()
  })
})

describe("toFtsMatch with synonyms", () => {
  it("adds synonym stems as quoted prefix terms", () => {
    const match = toFtsMatch("is my agency legal") ?? ""
    expect(match.startsWith('"is" OR "my" OR "agency"* OR "legal"*')).toBe(true)
    expect(match).toContain('"licen"*')
    expect(match).toContain('"broker"*')
  })
})
