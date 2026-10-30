import { CatalogWriter } from "@dadalink/ports"
import { Effect } from "effect"
import type { LoadedContent } from "./loadContent.ts"

export interface ImportSummary {
  readonly contentItems: number
  readonly translations: number
  readonly directoryEntries: number
  readonly countries: number
  readonly agencies: number
}

export const summarizeContent = (loaded: LoadedContent): ImportSummary => ({
  contentItems: loaded.items.length,
  translations: loaded.items.reduce((n, i) => n + i.translations.length, 0),
  directoryEntries: loaded.directory.reduce((n, d) => n + d.entries.length, 0),
  countries: loaded.directory.length,
  agencies: loaded.agencies.length
})

/** Replaces the catalogue with the loaded content through the `CatalogWriter` port. */
export const importContent = Effect.fn("importContent")(function* (loaded: LoadedContent) {
  const writer = yield* CatalogWriter
  yield* writer.replaceContent(loaded.items)
  for (const { country, entries } of loaded.directory) yield* writer.replaceDirectory(country, entries)
  yield* writer.replaceAgencies(loaded.agencies)
  return summarizeContent(loaded)
})
