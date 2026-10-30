import type { Agency, ContentId, ContentItem, Country, DirectoryEntry } from "@dadalink/domain"
import { appliesToCountry, FALLBACK_LOCALE, normalizeAgencyName, normalizeLicence, searchTerms } from "@dadalink/domain"
import {
  AgencyRepo,
  CatalogWriter,
  type ContentFilter,
  ContentRepo,
  DirectoryRepo,
  type Passage,
  type RetrievalQuery,
  Retriever
} from "@dadalink/ports"
import { Context, Effect, Layer, Option, Ref } from "effect"
import { Bm25Index } from "./bm25.ts"

interface CatalogState {
  readonly content: ReadonlyArray<ContentItem>
  readonly directory: ReadonlyMap<Country, ReadonlyArray<DirectoryEntry>>
  readonly agencies: ReadonlyArray<Agency>
}

const empty: CatalogState = { content: [], directory: new Map(), agencies: [] }

/** Shared mutable state behind the in-memory catalogue ports. */
export class MemoryCatalogState extends Context.Service<MemoryCatalogState, Ref.Ref<CatalogState>>()(
  "@dadalink/adapters/memory/MemoryCatalogState"
) {
  static readonly layer = Layer.effect(MemoryCatalogState, Ref.make(empty))
}

const matchesFilter = (filter: ContentFilter) => (item: ContentItem) =>
  (filter.kind === undefined || item.kind === filter.kind) &&
  (filter.phase === undefined || item.phase === filter.phase) &&
  (filter.country === undefined || appliesToCountry(item, filter.country)) &&
  (filter.topic === undefined || item.topics.includes(filter.topic))

const byId = <T extends { readonly id: string }>(a: T, b: T) => a.id.localeCompare(b.id)

const contentRepo = Layer.effect(
  ContentRepo,
  Effect.gen(function* () {
    const state = yield* MemoryCatalogState
    return ContentRepo.of({
      list: (filter) => Ref.get(state).pipe(Effect.map((s) => s.content.filter(matchesFilter(filter)).toSorted(byId))),
      get: (id: ContentId) =>
        Ref.get(state).pipe(Effect.map((s) => Option.fromNullishOr(s.content.find((i) => i.id === id))))
    })
  })
)

const directoryRepo = Layer.effect(
  DirectoryRepo,
  Effect.gen(function* () {
    const state = yield* MemoryCatalogState
    return DirectoryRepo.of({
      listByCountry: (country) => Ref.get(state).pipe(Effect.map((s) => s.directory.get(country) ?? []))
    })
  })
)

const agencyRepo = Layer.effect(
  AgencyRepo,
  Effect.gen(function* () {
    const state = yield* MemoryCatalogState
    return AgencyRepo.of({
      findByLicence: (licence) =>
        Ref.get(state).pipe(
          Effect.map((s) =>
            s.agencies
              .filter((a) => a.licenceNumber !== null && normalizeLicence(a.licenceNumber) === licence)
              .toSorted(byId)
          )
        ),
      searchByName: (name, limit) =>
        Ref.get(state).pipe(
          Effect.map((s) =>
            s.agencies
              .filter((a) => normalizeAgencyName(a.name).includes(name))
              .toSorted((a, b) => normalizeAgencyName(a.name).localeCompare(normalizeAgencyName(b.name)))
              .slice(0, limit)
          )
        )
    })
  })
)

const catalogWriter = Layer.effect(
  CatalogWriter,
  Effect.gen(function* () {
    const state = yield* MemoryCatalogState
    return CatalogWriter.of({
      replaceContent: (items) => Ref.update(state, (s) => ({ ...s, content: [...items] })),
      replaceDirectory: (country, entries) =>
        Ref.update(state, (s) => ({ ...s, directory: new Map(s.directory).set(country, [...entries]) })),
      replaceAgencies: (list) => Ref.update(state, (s) => ({ ...s, agencies: [...list] }))
    })
  })
)

const FIELD_WEIGHTS = { title: 5, summary: 2, body: 1 } as const

/** BM25 retriever with the same semantics as the FTS5 adapter. */
export const retrieveFrom = (content: ReadonlyArray<ContentItem>, query: RetrievalQuery): ReadonlyArray<Passage> => {
  const terms = searchTerms(query.text)
  if (terms.length === 0) return []
  const candidates = content
    .filter((item) => query.country === undefined || appliesToCountry(item, query.country))
    .flatMap((item) =>
      item.translations
        .filter((t) => t.locale === query.locale || t.locale === FALLBACK_LOCALE)
        .filter((t) => !query.reviewedOnly || t.status === "reviewed")
        .map((t) => ({ item, translation: t, key: `${item.id}\u0000${t.locale}` }))
    )
  const index = Bm25Index.make(
    candidates.map((c) => ({
      id: c.key,
      fields: { title: c.translation.title, summary: c.translation.summary, body: c.translation.body }
    })),
    FIELD_WEIGHTS
  )
  const byKey = new Map(candidates.map((c) => [c.key, c]))
  const best = new Map<string, Passage>()
  for (const hit of index.search(terms)) {
    const c = byKey.get(hit.id)
    if (c === undefined) continue
    const passage: Passage = {
      contentId: c.item.id,
      locale: c.translation.locale,
      status: c.translation.status,
      title: c.translation.title,
      text: `${c.translation.summary}\n\n${c.translation.body}`,
      score: hit.score
    }
    const existing = best.get(c.item.id)
    if (existing === undefined) best.set(c.item.id, passage)
    else if (existing.locale !== query.locale && passage.locale === query.locale)
      best.set(c.item.id, { ...passage, score: existing.score })
  }
  return [...best.values()].toSorted((a, b) => b.score - a.score).slice(0, query.limit)
}

const retriever = Layer.effect(
  Retriever,
  Effect.gen(function* () {
    const state = yield* MemoryCatalogState
    return Retriever.of({
      retrieve: (query) => Ref.get(state).pipe(Effect.map((s) => retrieveFrom(s.content, query)))
    })
  })
)

/** In-memory catalogue: content, directory, agencies, writer and BM25 retriever over one shared state. */
export const MemoryCatalog = {
  layer: Layer.mergeAll(contentRepo, directoryRepo, agencyRepo, catalogWriter, retriever).pipe(
    Layer.provideMerge(MemoryCatalogState.layer)
  )
}
