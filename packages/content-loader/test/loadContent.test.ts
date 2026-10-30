import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { loadContent } from "../src/index.ts"
import { INVALID, VALID } from "./fixtures.ts"

const load = (root: string) => loadContent(root).pipe(Effect.provide(NodeServices.layer))

describe("loadContent (valid tree)", () => {
  it.effect("maps rights files to one multilingual rights item", () =>
    Effect.gen(function* () {
      const { items } = yield* load(VALID)
      const rights = items.find((i) => i.id === "rights-sa")
      expect(rights?.kind).toBe("rights")
      expect(rights?.phase).toBe("abroad")
      expect(rights?.countries).toEqual(["SA"])
      expect(rights?.topics).toContain("rights")
      expect(rights?.translations.map((t) => t.locale).toSorted()).toEqual(["am", "en"])
      expect(rights?.sources[0]).toMatchObject({ publisher: "MHRSD", accessed: "2026-10-31" })
      expect(rights?.translations.find((t) => t.locale === "en")?.body).toContain("## Your passport")
    })
  )

  it.effect("maps journey articles with phase, countries, tags, related and the sensitive flag", () =>
    Effect.gen(function* () {
      const { items } = yield* load(VALID)
      const passport = items.find((i) => i.id === "passport-taken")
      expect(passport?.kind).toBe("article")
      expect(passport?.phase).toBe("abroad")
      expect(passport?.topics).toEqual(["passport", "documents"])
      expect(passport?.related).toEqual(["rights-sa"])
      expect(passport?.translations.map((t) => t.locale).toSorted()).toEqual(["en", "om"])
      const srh = items.find((i) => i.id === "contraception-and-srh-before-you-go")
      expect(srh?.sensitive).toBe(true)
      expect(srh?.translations[0]?.status).toBe("reviewed")
    })
  )

  it.effect("maps FAQ items to multilingual faq content linked to their articles", () =>
    Effect.gen(function* () {
      const { items } = yield* load(VALID)
      const faq = items.find((i) => i.id === "faq-passport-taken")
      expect(faq?.kind).toBe("faq")
      expect(faq?.related).toEqual(["passport-taken", "rights-sa"])
      const en = faq?.translations.find((t) => t.locale === "en")
      expect(en?.title).toBe("My employer took my passport. What can I do?")
      expect(en?.summary).toBe("This happens to many women.")
      expect(en?.body).toContain("Ask your embassy for help.")
      expect(faq?.translations.find((t) => t.locale === "am")?.summary).toBe("ይህ በብዙ ሴቶች ላይ ይደርሳል።")
    })
  )

  it.effect("maps directory files per country, keeping order, short codes and localized names", () =>
    Effect.gen(function* () {
      const { directory } = yield* load(VALID)
      const sa = directory.find((d) => d.country === "SA")?.entries ?? []
      expect(sa.map((e) => e.id)).toEqual(["sa-police", "sa-ethiopian-embassy-riyadh"])
      expect(sa[0]).toMatchObject({
        shortCode: "999",
        phone: null,
        emergency: true,
        names: { am: "ፖሊስ", om: "Poolisii" }
      })
      expect(sa[0]?.names).not.toHaveProperty("en")
      expect(sa[1]).toMatchObject({
        emergency: false,
        phone: "+966114823919",
        city: "Riyadh",
        url: "https://example.org/embassy"
      })
      expect(directory.map((d) => d.country).toSorted()).toEqual(["LB", "SA"])
    })
  )

  it.effect("maps agencies and keeps the user guidance", () =>
    Effect.gen(function* () {
      const { agencies, agencyGuides } = yield* load(VALID)
      expect(agencies).toHaveLength(1)
      expect(agencies[0]).toMatchObject({ status: "licensed", licenceNumber: "FIXTURE/001", region: "Addis Ababa" })
      expect(agencyGuides[0]?.howToCheck).toContain("licence")
    })
  )

  it.effect("ignores files outside the known layout", () =>
    Effect.gen(function* () {
      const { items, warnings } = yield* load(VALID)
      expect(items).toHaveLength(4)
      expect(warnings).toEqual([])
    })
  )
})

describe("loadContent (invalid tree)", () => {
  it.effect("reports every problem with its file instead of stopping at the first", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(load(INVALID))
      if (error._tag !== "ContentValidationFailed") return expect.fail(`unexpected ${error._tag}`)
      const byFile = (file: string) =>
        error.issues
          .filter((i) => i.file === file)
          .map((i) => i.message)
          .join("\n")
      expect(byFile("directory/sa.yaml")).toMatch(/country/i)
      expect(byFile("rights/sa.am.md")).toMatch(/English/i)
      expect(byFile("journey/abroad/unpaid-wages.en.md")).toMatch(/locale/i)
      expect(byFile("journey/abroad/unpaid-wages.en.md")).toMatch(/phase/i)
      expect(byFile("journey/abroad/broken.en.md")).toMatch(/front matter/i)
      expect(byFile("assistant/faq-seed.yaml")).toMatch(/does-not-exist/)
    })
  )
})
