import type { Agency, ContentItem, Country, DirectoryEntry } from "@dadalink/domain"
import { normalizeAgencyName, normalizeLicence } from "@dadalink/domain"
import { CatalogWriter } from "@dadalink/ports"
import { eq } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { Database } from "../Database.ts"
import { persistence } from "../persistence.ts"
import { agencies, contentItems, contentTranslations, directoryEntries } from "../schema/index.ts"

/** Row mappers are exported so the SQL seed emitter produces identical rows. */
export const contentItemRow = (item: ContentItem): typeof contentItems.$inferInsert => ({
  id: item.id,
  kind: item.kind,
  phase: item.phase,
  countries: item.countries,
  topics: item.topics,
  sources: item.sources.map((source) => ({
    title: source.title,
    url: source.url,
    ...(source.publisher === undefined ? {} : { publisher: source.publisher }),
    ...(source.accessed === undefined ? {} : { accessed: source.accessed })
  })),
  sensitive: item.sensitive,
  related: item.related,
  updated: item.updated ?? null
})

export const contentTranslationRows = (item: ContentItem): Array<typeof contentTranslations.$inferInsert> =>
  item.translations.map((t) => ({
    contentId: item.id,
    locale: t.locale,
    status: t.status,
    title: t.title,
    summary: t.summary,
    body: t.body
  }))

export const directoryEntryRow = (entry: DirectoryEntry, position: number): typeof directoryEntries.$inferInsert => ({
  id: entry.id,
  country: entry.country,
  position,
  kind: entry.kind,
  name: entry.name,
  names: entry.names,
  phone: entry.phone,
  shortCode: entry.shortCode,
  whatsapp: entry.whatsapp ?? null,
  telegram: entry.telegram ?? null,
  email: entry.email ?? null,
  url: entry.url ?? null,
  city: entry.city ?? null,
  address: entry.address ?? null,
  hours: entry.hours ?? null,
  notes: entry.notes ?? null,
  helpsWith: entry.helpsWith,
  languages: entry.languages,
  emergency: entry.emergency,
  sourceUrl: entry.sourceUrl,
  verified: entry.verified,
  lastVerified: entry.lastVerified ?? null
})

export const agencyRow = (agency: Agency): typeof agencies.$inferInsert => ({
  id: agency.id,
  name: agency.name,
  nameNormalized: normalizeAgencyName(agency.name),
  licenceNumber: agency.licenceNumber,
  licenceNormalized: agency.licenceNumber === null ? null : normalizeLicence(agency.licenceNumber),
  status: agency.status,
  region: agency.region ?? null,
  phone: agency.phone ?? null,
  address: agency.address ?? null,
  sourceUrl: agency.sourceUrl,
  verifiedAt: agency.verifiedAt ?? null
})

/**
 * Rows are written one statement at a time: D1 caps bound parameters per
 * statement, and catalogue sizes are small (hundreds of rows).
 */
export const CatalogWriterDrizzle = Layer.effect(
  CatalogWriter,
  Effect.gen(function* () {
    const db = yield* Database

    const replaceContent = Effect.fn("CatalogWriter.replaceContent")((items: ReadonlyArray<ContentItem>) =>
      Effect.gen(function* () {
        yield* db.delete(contentTranslations)
        yield* db.delete(contentItems)
        for (const item of items) {
          yield* db.insert(contentItems).values(contentItemRow(item))
          for (const row of contentTranslationRows(item)) {
            yield* db.insert(contentTranslations).values(row)
          }
        }
      }).pipe(persistence("CatalogWriter.replaceContent"))
    )

    const replaceDirectory = Effect.fn("CatalogWriter.replaceDirectory")(
      (country: Country, entries: ReadonlyArray<DirectoryEntry>) =>
        Effect.gen(function* () {
          yield* db.delete(directoryEntries).where(eq(directoryEntries.country, country))
          for (const [position, entry] of entries.entries()) {
            yield* db.insert(directoryEntries).values(directoryEntryRow(entry, position))
          }
        }).pipe(persistence("CatalogWriter.replaceDirectory"))
    )

    const replaceAgencies = Effect.fn("CatalogWriter.replaceAgencies")((list: ReadonlyArray<Agency>) =>
      Effect.gen(function* () {
        yield* db.delete(agencies)
        for (const agency of list) {
          yield* db.insert(agencies).values(agencyRow(agency))
        }
      }).pipe(persistence("CatalogWriter.replaceAgencies"))
    )

    return CatalogWriter.of({ replaceContent, replaceDirectory, replaceAgencies })
  })
)
