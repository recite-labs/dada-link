import { describe, expect, it } from "vitest"
import { CATALOG, negotiateLocale, UI_LOCALES } from "../../src/i18n/index.ts"

/** Paths of every leaf in a catalogue (functions and arrays count as leaves). */
const leaves = (value: unknown, prefix = ""): ReadonlyArray<string> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.entries(value).flatMap(([key, child]) => leaves(child, prefix === "" ? key : `${prefix}.${key}`))
    : [prefix]

describe("message catalogue", () => {
  it("has exactly the English keys in every language", () => {
    const english = leaves(CATALOG.en)
    for (const locale of UI_LOCALES) expect(leaves(CATALOG[locale]), locale).toEqual(english)
  })

  it("has no empty strings", () => {
    for (const locale of UI_LOCALES) {
      const walk = (value: unknown): void => {
        if (typeof value === "string") expect(value.trim(), locale).not.toBe("")
        else if (typeof value === "object" && value !== null) Object.values(value).forEach(walk)
      }
      walk(CATALOG[locale])
    }
  })

  it("marks Amharic and Afaan Oromo as drafts awaiting native review", () => {
    expect(CATALOG.en.meta.status).toBe("source")
    expect(CATALOG.am.meta.status).toBe("draft-ai")
    expect(CATALOG.om.meta.status).toBe("draft-ai")
  })

  it("interpolates country names", () => {
    expect(CATALOG.en.emergency.subtitle(CATALOG.en.countries.SA)).toBe("Emergency numbers in Saudi Arabia")
  })
})

describe("negotiateLocale", () => {
  it("picks the first supported browser language", () => {
    expect(negotiateLocale(["fr-FR", "om-ET", "en"])).toBe("om")
    expect(negotiateLocale(["en-GB"])).toBe("en")
  })

  it("defaults to Amharic", () => {
    expect(negotiateLocale(["fr", "ar-SA"])).toBe("am")
    expect(negotiateLocale([])).toBe("am")
  })
})
