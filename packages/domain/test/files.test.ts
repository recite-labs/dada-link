import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { ContentFiles } from "../src/index.ts"

const source = { url: "https://www.ilo.org/", title: "ILO", accessed: "2026-10-31" }

describe("content file schemas (Track B contract)", () => {
  it("decodes rights and journey front matter, discriminated by type", () => {
    const rights = Schema.decodeUnknownSync(ContentFiles.ContentFrontMatter)({
      id: "rights-sa",
      type: "rights",
      country: "SA",
      locale: "en",
      title: "Your rights",
      summary: "Summary.",
      status: "draft-ai",
      verified: false,
      translation_of: null,
      updated: "2026-10-31",
      sources: [source],
      todo: []
    })
    expect(rights.type).toBe("rights")
    const journey = Schema.decodeUnknownSync(ContentFiles.ContentFrontMatter)({
      id: "passport-taken",
      type: "journey",
      phase: "abroad",
      locale: "am",
      title: "ፓስፖርቴ",
      summary: "ማጠቃለያ",
      countries: ["SA", "AE"],
      tags: ["passport", "documents"],
      sensitive: false,
      status: "draft-ai",
      verified: false,
      translation_of: "passport-taken",
      related: ["rights-sa"]
    })
    expect(journey.type === "journey" && journey.tags).toEqual(["passport", "documents"])
  })

  it("rejects unknown help topics and bad statuses", () => {
    expect(() =>
      Schema.decodeUnknownSync(ContentFiles.JourneyFrontMatter)({
        id: "x",
        type: "journey",
        phase: "abroad",
        locale: "en",
        title: "t",
        summary: "s",
        countries: [],
        tags: ["gossip"],
        status: "draft-ai",
        verified: false
      })
    ).toThrow()
  })

  it("decodes a directory file with nullable fields and short codes", () => {
    const file = Schema.decodeUnknownSync(ContentFiles.DirectoryFile)({
      country: "SA",
      updated: "2026-10-31",
      entries: [
        {
          id: "sa-police",
          country: "SA",
          kind: "police",
          name: { en: "Police", am: "ፖሊስ" },
          name_status: "draft-ai",
          helps_with: ["emergency"],
          phone: null,
          short_code: "999",
          whatsapp: null,
          telegram: null,
          email: null,
          website: null,
          hours: "24/7",
          languages: [],
          city: null,
          address: null,
          notes: null,
          source_url: "https://www.stc.com.sa/",
          sources: [],
          verified: false,
          todo: "Confirm."
        }
      ]
    })
    expect(file.entries[0]?.short_code).toBe("999")
  })

  it("requires English in localized names and at least one help topic", () => {
    const base = {
      id: "sa-x",
      country: "SA",
      kind: "ngo",
      helps_with: ["shelter"],
      source_url: "https://example.org/",
      verified: false
    }
    expect(() => Schema.decodeUnknownSync(ContentFiles.DirectoryFileEntry)({ ...base, name: { am: "x" } })).toThrow()
    expect(() =>
      Schema.decodeUnknownSync(ContentFiles.DirectoryFileEntry)({ ...base, name: { en: "x" }, helps_with: [] })
    ).toThrow()
  })

  it("decodes agency and FAQ files", () => {
    const agencies = Schema.decodeUnknownSync(ContentFiles.AgencyFile)({
      country: "ET",
      authority: { name: "MoLS", website: "https://mols.gov.et" },
      how_to_obtain: "Ask MoLS.",
      agencies: []
    })
    expect(agencies.agencies).toEqual([])
    const faq = Schema.decodeUnknownSync(ContentFiles.FaqFile)({
      items: [
        {
          id: "faq-passport-taken",
          question: { en: "Q?" },
          answer: { en: "A." },
          status: "draft-ai",
          tags: ["passport"],
          countries: [],
          emergency: false,
          articles: ["passport-taken"],
          verified: false
        }
      ]
    })
    expect(faq.items[0]?.id).toBe("faq-passport-taken")
    expect(() => Schema.decodeUnknownSync(ContentFiles.FaqFileItem)({ ...faq.items[0], id: "passport-faq" })).toThrow()
  })
})
