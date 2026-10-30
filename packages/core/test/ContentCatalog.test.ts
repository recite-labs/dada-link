import type { ContentId } from "@dadalink/domain"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { ContentCatalog } from "../src/index.ts"
import { SeededCatalog } from "./seed.ts"

const TestLayer = ContentCatalog.layer.pipe(Layer.provideMerge(SeededCatalog))

describe("ContentCatalog", () => {
  it.effect("lists summaries resolved to the requested locale with English fallback", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog
      const summaries = yield* catalog.list({ locale: "am" })
      const wages = summaries.find((s) => s.id === "abroad/unpaid-wages")
      expect(wages?.locale).toBe("am")
      expect(wages?.title).toBe("ደሞዝዎ ካልተከፈለ")
      const rights = summaries.find((s) => s.id === "rights-sa")
      expect(rights?.locale).toBe("en")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("passes phase and country filters through", () =>
    Effect.gen(function* () {
      const catalog = yield* ContentCatalog
      expect((yield* catalog.list({ locale: "en", phase: "before" })).map((s) => s.id)).toEqual([
        "before/contraception"
      ])
      expect((yield* catalog.list({ locale: "en", country: "LB" })).map((s) => s.id)).not.toContain("rights-sa")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("gets a localised item including body, sources and available locales", () =>
    Effect.gen(function* () {
      const item = yield* (yield* ContentCatalog).get("abroad/unpaid-wages" as ContentId, "om")
      expect(item.locale).toBe("en")
      expect(item.requestedLocale).toBe("om")
      expect(item.availableLocales.toSorted()).toEqual(["am", "en"])
      expect(item.sources[0]?.url).toBe("https://www.ilo.org/")
      expect(item.body).toContain("labour hotline")
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect("fails with NotFound for an unknown id", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* ContentCatalog).get("nope" as ContentId, "en"))
      expect(error._tag).toBe("NotFound")
    }).pipe(Effect.provide(TestLayer))
  )
})
