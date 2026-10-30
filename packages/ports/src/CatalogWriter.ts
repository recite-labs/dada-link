import type { Agency, ContentItem, Country, DirectoryEntry } from "@dadalink/domain"
import { Context, type Effect } from "effect"
import type { PersistenceError } from "./errors.ts"

/**
 * Write side used by the content loader. Each method replaces the whole
 * collection (content files are the source of truth), keeping the search
 * index in sync.
 */
export class CatalogWriter extends Context.Service<
  CatalogWriter,
  {
    replaceContent(items: ReadonlyArray<ContentItem>): Effect.Effect<void, PersistenceError>
    replaceDirectory(country: Country, entries: ReadonlyArray<DirectoryEntry>): Effect.Effect<void, PersistenceError>
    replaceAgencies(agencies: ReadonlyArray<Agency>): Effect.Effect<void, PersistenceError>
  }
>()("@dadalink/ports/CatalogWriter") {}
