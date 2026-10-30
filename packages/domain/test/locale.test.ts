import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { Country, EmergencyCapableCountry, isDestinationCountry, JourneyPhase, LOCALES, Locale } from "../src/index.ts"

describe("Locale", () => {
  it("accepts the five supported locales", () => {
    for (const locale of ["am", "om", "en", "sw", "ti"]) {
      expect(Schema.decodeUnknownSync(Locale)(locale)).toBe(locale)
    }
    expect(LOCALES).toEqual(["am", "om", "en", "sw", "ti"])
  })

  it("rejects unsupported locales", () => {
    expect(() => Schema.decodeUnknownSync(Locale)("fr")).toThrow()
  })
})

describe("Country", () => {
  it("accepts destination countries and Ethiopia", () => {
    for (const c of ["SA", "AE", "KW", "QA", "LB", "JO", "ET"]) {
      expect(Schema.decodeUnknownSync(Country)(c)).toBe(c)
    }
  })

  it("rejects lower case and unknown codes", () => {
    expect(() => Schema.decodeUnknownSync(Country)("sa")).toThrow()
    expect(() => Schema.decodeUnknownSync(Country)("US")).toThrow()
  })

  it("distinguishes destinations from the origin country", () => {
    expect(isDestinationCountry("SA")).toBe(true)
    expect(isDestinationCountry("ET")).toBe(false)
    expect(Schema.is(EmergencyCapableCountry)("ET")).toBe(true)
  })
})

describe("JourneyPhase", () => {
  it("accepts before, abroad and return", () => {
    for (const p of ["before", "abroad", "return"]) {
      expect(Schema.decodeUnknownSync(JourneyPhase)(p)).toBe(p)
    }
    expect(() => Schema.decodeUnknownSync(JourneyPhase)("during")).toThrow()
  })
})
