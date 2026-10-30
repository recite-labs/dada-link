import { describe, expect, it } from "@effect/vitest"
import { buildSosText } from "../../src/index.ts"

describe("buildSosText", () => {
  it("includes the location with rounded coordinates and accuracy", () => {
    const text = buildSosText({
      locale: "en",
      location: { latitude: 24.713612345, longitude: 46.675312345, accuracyMeters: 18.4 }
    })
    expect(text).toContain("https://maps.google.com/?q=24.71361,46.67531")
    expect(text).toContain("18 m")
  })

  it("says the location is unknown when it was not shared", () => {
    expect(buildSosText({ locale: "en" })).toMatch(/location (is )?not shared/i)
  })

  it("stays short enough for two SMS segments in English", () => {
    const text = buildSosText({ locale: "en", message: "x".repeat(120), location: { latitude: 1, longitude: 2 } })
    expect(text.length).toBeLessThanOrEqual(306)
  })
})
