import type { Agency, ContentItem, DirectoryEntry } from "@dadalink/domain"
import { normalizeAgencyName, normalizeLicence } from "@dadalink/domain"
import { AgencyRepo, CatalogWriter, ContentRepo, DirectoryRepo } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, type Layer, Option } from "effect"
import {
  agencies,
  allContent,
  contraception,
  lbDirectory,
  passportRetention,
  saDirectory,
  unpaidWages
} from "../fixtures.ts"

type CatalogServices = ContentRepo | DirectoryRepo | AgencyRepo | CatalogWriter

/** Translation order carries no meaning; compare items order-insensitively. */
const canonical = (item: ContentItem | undefined) =>
  item === undefined
    ? undefined
    : { ...item, translations: item.translations.toSorted((a, b) => a.locale.localeCompare(b.locale)) }

const ids = (items: ReadonlyArray<ContentItem | DirectoryEntry | Agency>) => items.map((i) => i.id).toSorted()

/**
 * Behaviour every catalogue adapter (in-memory, SQLite, D1) must satisfy.
 * `makeLayer` must return a fresh, empty store on every call.
 */
export const catalogContract = (name: string, makeLayer: () => Layer.Layer<CatalogServices, unknown>) => {
  const run = <A, E>(effect: Effect.Effect<A, E, CatalogServices>) => Effect.provide(effect, makeLayer())

  const seeded = Effect.gen(function* () {
    const writer = yield* CatalogWriter
    yield* writer.replaceContent(allContent)
    yield* writer.replaceDirectory("SA", saDirectory)
    yield* writer.replaceDirectory("LB", lbDirectory)
    yield* writer.replaceAgencies(agencies)
  })

  describe(`${name}: ContentRepo`, () => {
    it.effect("lists every item without a filter and round-trips all fields", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const items = yield* (yield* ContentRepo).list({})
          expect(ids(items)).toEqual(ids(allContent))
          const wages = items.find((i) => i.id === unpaidWages.id)
          expect(canonical(wages)).toEqual(canonical(unpaidWages))
        })
      )
    )

    it.effect("filters by phase, kind and topic", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const repo = yield* ContentRepo
          expect(ids(yield* repo.list({ phase: "before" }))).toEqual([contraception.id])
          expect(ids(yield* repo.list({ kind: "rights" }))).toEqual([passportRetention.id])
          expect(ids(yield* repo.list({ topic: "srh" }))).toEqual([contraception.id])
        })
      )
    )

    it.effect("country filter keeps global items and items for that country", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const repo = yield* ContentRepo
          expect(ids(yield* repo.list({ country: "SA" }))).toEqual(ids(allContent))
          expect(ids(yield* repo.list({ country: "LB" }))).toEqual(ids([unpaidWages, contraception]))
        })
      )
    )

    it.effect("gets one item by id or none", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const repo = yield* ContentRepo
          expect(yield* repo.get(passportRetention.id)).toEqual(Option.some(passportRetention))
          expect(Option.isNone(yield* repo.get("missing" as ContentItem["id"]))).toBe(true)
        })
      )
    )

    it.effect("replacing content removes items that are no longer present", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          yield* (yield* CatalogWriter).replaceContent([unpaidWages])
          expect(ids(yield* (yield* ContentRepo).list({}))).toEqual([unpaidWages.id])
        })
      )
    )
  })

  describe(`${name}: DirectoryRepo`, () => {
    it.effect("lists entries of one country in curated order with optional fields intact", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const entries = yield* (yield* DirectoryRepo).listByCountry("SA")
          expect(entries).toEqual(saDirectory)
        })
      )
    )

    it.effect("replacing one country leaves the others untouched", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const firstEntry = saDirectory[0]
          if (firstEntry === undefined) return yield* Effect.die("fixture missing")
          yield* (yield* CatalogWriter).replaceDirectory("SA", [firstEntry])
          const repo = yield* DirectoryRepo
          expect((yield* repo.listByCountry("SA")).length).toBe(1)
          expect(yield* repo.listByCountry("LB")).toEqual(lbDirectory)
          expect(yield* repo.listByCountry("QA")).toEqual([])
        })
      )
    )
  })

  describe(`${name}: AgencyRepo`, () => {
    it.effect("finds agencies by normalised licence number", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const found = yield* (yield* AgencyRepo).findByLicence(normalizeLicence("mols oea 001 2024"))
          expect(ids(found)).toEqual(["et-agency-001"])
        })
      )
    )

    it.effect("searches agencies by normalised name fragment", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const repo = yield* AgencyRepo
          expect(ids(yield* repo.searchByName(normalizeAgencyName("selam overseas"), 10))).toEqual(["et-agency-001"])
          expect(ids(yield* repo.searchByName(normalizeAgencyName("employment"), 10))).toEqual(ids(agencies))
          expect((yield* repo.searchByName(normalizeAgencyName("employment"), 1)).length).toBe(1)
          expect(yield* repo.searchByName("unknown agency", 10)).toEqual([])
        })
      )
    )

    it.effect("round-trips agency records", () =>
      run(
        Effect.gen(function* () {
          yield* seeded
          const [found] = yield* (yield* AgencyRepo).findByLicence(normalizeLicence("MoLS/OEA/001/2024"))
          expect(found).toEqual(agencies[0])
        })
      )
    )
  })
}
