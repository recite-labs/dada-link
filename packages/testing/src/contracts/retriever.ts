import { CatalogWriter, Retriever } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, type Layer } from "effect"
import { allContent, contraception, passportRetention, unpaidWages } from "../fixtures.ts"

type RetrieverServices = Retriever | CatalogWriter

/** Behaviour every Retriever (FTS5, BM25) must satisfy. */
export const retrieverContract = (name: string, makeLayer: () => Layer.Layer<RetrieverServices, unknown>) => {
  const run = <A, E>(effect: Effect.Effect<A, E, RetrieverServices>) =>
    Effect.provide(
      Effect.gen(function* () {
        yield* (yield* CatalogWriter).replaceContent(allContent)
        return yield* effect
      }),
      makeLayer()
    )

  describe(`${name}: Retriever`, () => {
    it.effect("ranks the most relevant English passage first", () =>
      run(
        Effect.gen(function* () {
          const passages = yield* (yield* Retriever).retrieve({
            text: "my employer did not pay my salary",
            locale: "en",
            limit: 3,
            reviewedOnly: false
          })
          expect(passages[0]?.contentId).toBe(unpaidWages.id)
          expect(passages[0]?.locale).toBe("en")
          expect(passages[0]?.title).toBe("When your salary is not paid")
        })
      )
    )

    it.effect("searches the user's locale (Ethiopic script)", () =>
      run(
        Effect.gen(function* () {
          const passages = yield* (yield* Retriever).retrieve({
            text: "ደሞዝዎን",
            locale: "am",
            limit: 3,
            reviewedOnly: false
          })
          expect(passages.map((p) => [p.contentId, p.locale])).toContainEqual([unpaidWages.id, "am"])
        })
      )
    )

    it.effect("falls back to English passages for other locales", () =>
      run(
        Effect.gen(function* () {
          const passages = yield* (yield* Retriever).retrieve({
            text: "passport",
            locale: "om",
            limit: 3,
            reviewedOnly: false
          })
          expect(passages[0]?.contentId).toBe(passportRetention.id)
          expect(passages[0]?.locale).toBe("en")
        })
      )
    )

    it.effect("excludes unreviewed translations when reviewedOnly is set", () =>
      run(
        Effect.gen(function* () {
          const retriever = yield* Retriever
          const all = yield* retriever.retrieve({
            text: "contraception implant",
            locale: "en",
            limit: 5,
            reviewedOnly: false
          })
          expect(all.map((p) => p.contentId)).toContain(contraception.id)
          const reviewed = yield* retriever.retrieve({
            text: "contraception implant",
            locale: "en",
            limit: 5,
            reviewedOnly: true
          })
          expect(reviewed.map((p) => p.contentId)).not.toContain(contraception.id)
        })
      )
    )

    it.effect("restricts country-specific content to that country", () =>
      run(
        Effect.gen(function* () {
          const retriever = yield* Retriever
          const lb = yield* retriever.retrieve({
            text: "passport",
            locale: "en",
            country: "LB",
            limit: 5,
            reviewedOnly: false
          })
          expect(lb.map((p) => p.contentId)).not.toContain(passportRetention.id)
          const sa = yield* retriever.retrieve({
            text: "passport",
            locale: "en",
            country: "SA",
            limit: 5,
            reviewedOnly: false
          })
          expect(sa.map((p) => p.contentId)).toContain(passportRetention.id)
        })
      )
    )

    it.effect("respects the limit and returns nothing for blank or unmatched queries", () =>
      run(
        Effect.gen(function* () {
          const retriever = yield* Retriever
          const limited = yield* retriever.retrieve({
            text: "salary passport contraception",
            locale: "en",
            limit: 1,
            reviewedOnly: false
          })
          expect(limited.length).toBe(1)
          expect(yield* retriever.retrieve({ text: "   ", locale: "en", limit: 5, reviewedOnly: false })).toEqual([])
          expect(yield* retriever.retrieve({ text: "zzzzqqq", locale: "en", limit: 5, reviewedOnly: false })).toEqual(
            []
          )
        })
      )
    )

    it.effect("treats query syntax characters as plain text", () =>
      run(
        Effect.gen(function* () {
          const passages = yield* (yield* Retriever).retrieve({
            text: 'salary" OR * NEAR( -passport) ^ AND:',
            locale: "en",
            limit: 5,
            reviewedOnly: false
          })
          expect(passages.map((p) => p.contentId)).toContain(unpaidWages.id)
        })
      )
    )
  })
}
