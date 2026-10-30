import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { ContentItem, ContentTranslation, pickTranslation, Source } from "../src/index.ts"

const translation = (locale: string, status = "reviewed") => ({
  locale,
  status,
  title: `Title ${locale}`,
  summary: `Summary ${locale}`,
  body: `Body ${locale}`
})

const item = {
  id: "abroad/isolation",
  kind: "article",
  phase: "abroad",
  countries: [],
  topics: ["mental-health"],
  sources: [{ title: "WHO", url: "https://www.who.int/" }],
  translations: [translation("en"), translation("am", "draft-ai")]
}

describe("ContentItem", () => {
  it("decodes and round-trips through encode", () => {
    const decoded = Schema.decodeUnknownSync(ContentItem)(item)
    expect(decoded.translations).toHaveLength(2)
    expect(Schema.encodeSync(ContentItem)(decoded)).toEqual(item)
  })

  it("rejects unknown topics and kinds", () => {
    expect(() => Schema.decodeUnknownSync(ContentItem)({ ...item, topics: ["gossip"] })).toThrow()
    expect(() => Schema.decodeUnknownSync(ContentItem)({ ...item, kind: "tweet" })).toThrow()
  })

  it("requires at least one translation", () => {
    expect(() => Schema.decodeUnknownSync(ContentItem)({ ...item, translations: [] })).toThrow()
  })

  it("rejects duplicate translation locales", () => {
    expect(() =>
      Schema.decodeUnknownSync(ContentItem)({ ...item, translations: [translation("en"), translation("en")] })
    ).toThrow()
  })

  it("allows a null phase for content that applies to the whole journey", () => {
    expect(Schema.decodeUnknownSync(ContentItem)({ ...item, phase: null }).phase).toBeNull()
  })
})

describe("ContentTranslation", () => {
  it("rejects empty titles and unknown review status", () => {
    expect(() => Schema.decodeUnknownSync(ContentTranslation)({ ...translation("en"), title: "" })).toThrow()
    expect(() => Schema.decodeUnknownSync(ContentTranslation)(translation("en", "approved-ish"))).toThrow()
  })
})

describe("Source", () => {
  it("requires an http(s) url", () => {
    expect(() => Schema.decodeUnknownSync(Source)({ title: "x", url: "ftp://example.org" })).toThrow()
  })
})

describe("pickTranslation", () => {
  const decoded = Schema.decodeUnknownSync(ContentItem)(item)

  it("returns the requested locale when present", () => {
    expect(pickTranslation(decoded, "am")?.locale).toBe("am")
  })

  it("falls back to English, then to the first translation", () => {
    expect(pickTranslation(decoded, "om")?.locale).toBe("en")
    const amOnly = Schema.decodeUnknownSync(ContentItem)({ ...item, translations: [translation("am")] })
    expect(pickTranslation(amOnly, "ti")?.locale).toBe("am")
  })
})
