import { fileURLToPath } from "node:url"
import { MemoryCatalog } from "@dadalink/adapters"
import { importContent, loadContent } from "@dadalink/content-loader"
import type { Locale } from "@dadalink/domain"
import { Retriever } from "@dadalink/ports"
import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { PersistenceLive } from "../src/AppLayer.ts"

/**
 * Retrieval regressions against the real, reviewed content tree. Both
 * retrievers (FTS5 on SQLite and the in-memory BM25 fallback) must surface the
 * right article for questions users actually ask, using the assistant's
 * defaults (reviewed content only, 4 passages).
 */
const CONTENT_DIR = fileURLToPath(new URL("../../../content", import.meta.url))
const MAX_PASSAGES = 4

const retrievers = {
  "SQLite FTS5": () => PersistenceLive(":memory:"),
  "in-memory BM25": () => MemoryCatalog.layer
} as const

const AGENCY_ARTICLE = "licensed-agencies-vs-brokers"
const AGENCY_FAQ = "faq-check-agency-licence"

const agencyQuestions: ReadonlyArray<readonly [Locale, string]> = [
  ["en", "How do I know if my agency is legal?"],
  ["en", "Is my recruiter licensed?"],
  ["en", "how can i check the broker is registered"],
  ["am", "ኤጀንሲዬ ሕጋዊ መሆኑን እንዴት አውቃለሁ?"],
  ["am", "ደላላው ፈቃድ እንዳለው እንዴት አረጋግጣለሁ?"],
  ["om", "Ejensiin koo seeraan hayyama qabaachuu isaa akkamiin beeka?"],
  ["om", "Delaalaan kun seera qabeessa ta'uu isaa akkamiin mirkaneessa?"]
]

for (const [name, makeLayer] of Object.entries(retrievers)) {
  describe(`${name}: retrieval over the real content`, () => {
    const retrieve = (locale: Locale, text: string) =>
      Effect.gen(function* () {
        const loaded = yield* loadContent(CONTENT_DIR)
        yield* importContent(loaded)
        return yield* (yield* Retriever).retrieve({
          text,
          locale,
          country: "AE",
          limit: MAX_PASSAGES,
          reviewedOnly: true
        })
      }).pipe(Effect.provide(Layer.mergeAll(makeLayer(), NodeServices.layer)))

    for (const [locale, question] of agencyQuestions) {
      it.effect(`[${locale}] "${question}" retrieves the agency article and FAQ first`, () =>
        Effect.gen(function* () {
          const passages = yield* retrieve(locale, question)
          const top = passages.slice(0, 2)
          expect(top.map((p) => p.contentId).toSorted()).toEqual([AGENCY_FAQ, AGENCY_ARTICLE].toSorted())
          for (const p of top) expect(p.locale).toBe(locale)
          expect(top.find((p) => p.contentId === AGENCY_ARTICLE)?.text).toContain("1389/2025")
        })
      )
    }

    it.effect("synonyms do not crowd out other topics", () =>
      Effect.gen(function* () {
        const passport = yield* retrieve("en", "My employer took my passport")
        expect(passport.map((p) => p.contentId)).toContain("passport-taken")
        const wages = yield* retrieve("en", "My salary was not paid for three months")
        expect(wages.map((p) => p.contentId)).toContain("unpaid-wages")
      })
    )
  })
}
