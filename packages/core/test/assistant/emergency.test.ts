import { describe, expect, it } from "@effect/vitest"
import { detectEmergency } from "../../src/index.ts"

describe("detectEmergency", () => {
  it.each([
    ["en", "My madam beats me every night", "violence"],
    ["en", "He said he will kill me", "threat-to-life"],
    ["en", "I want to end my life", "suicidal"],
    ["en", "I am bleeding a lot and feel dizzy", "medical"],
    ["am", "አሠሪዬ ይደበድበኛል", "violence"],
    ["am", "መኖር አልፈልግም", "suicidal"],
    ["om", "Haati manaa na rukuti", "violence"],
    ["om", "Of ajjeesuu barbaada", "suicidal"],
    ["sw", "Bosi ananipiga kila siku", "violence"],
    ["sw", "Natoka damu nyingi", "medical"],
    ["ti", "ክቐትለኒ እዩ ዝብል", "threat-to-life"],
    ["ti", "ክነብር ኣይደልን", "suicidal"]
  ] as const)("%s: %s → %s", (_locale, text, category) => {
    expect(detectEmergency(text)).toContain(category)
  })

  it("returns no category for everyday questions", () => {
    expect(detectEmergency("How do I renew my passport?")).toEqual([])
    expect(detectEmergency("ፓስፖርቴን እንዴት አድሳለሁ?")).toEqual([])
  })

  it("matches at word starts only for Latin script", () => {
    expect(detectEmergency("The rainy season has begun")).toEqual([])
  })

  it("reports several categories at once without duplicates", () => {
    const categories = detectEmergency("He raped me and now I am bleeding, he will kill me")
    expect(categories.toSorted()).toEqual(["medical", "threat-to-life", "violence"])
  })
})
