import { MemoryCatalog } from "@dadalink/adapters"
import { ContentRepo, DirectoryRepo, Retriever } from "@dadalink/ports"
import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { importContent, loadContent } from "../src/index.ts"
import { VALID } from "./fixtures.ts"

describe("importContent", () => {
  it.effect("replaces the catalogue through the CatalogWriter port and reports counts", () =>
    Effect.gen(function* () {
      const loaded = yield* loadContent(VALID)
      const summary = yield* importContent(loaded)
      expect(summary).toEqual({ contentItems: 4, translations: 7, directoryEntries: 3, countries: 2, agencies: 1 })
      expect((yield* (yield* ContentRepo).list({})).length).toBe(4)
      expect((yield* (yield* DirectoryRepo).listByCountry("LB")).map((e) => e.id)).toEqual(["lb-isf"])
      const passages = yield* (yield* Retriever).retrieve({
        text: "passport",
        locale: "om",
        limit: 3,
        reviewedOnly: false
      })
      expect(passages.map((p) => p.contentId)).toContain("passport-taken")
    }).pipe(Effect.provide(Layer.mergeAll(MemoryCatalog.layer, NodeServices.layer)))
  )
})
