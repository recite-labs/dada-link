import type { Country, DirectoryEntry } from "@dadalink/domain"
import { Context, type Effect } from "effect"
import type { PersistenceError } from "./errors.ts"

/** Per-country help directory (embassies, hotlines, shelters, emergency numbers). */
export class DirectoryRepo extends Context.Service<
  DirectoryRepo,
  {
    /** Entries for a country in curated display order. */
    listByCountry(country: Country): Effect.Effect<ReadonlyArray<DirectoryEntry>, PersistenceError>
  }
>()("@dadalink/ports/DirectoryRepo") {}
