import type { Agency } from "@dadalink/domain"
import { Context, type Effect } from "effect"
import type { PersistenceError } from "./errors.ts"

/** Licensed recruitment agency register. Inputs are already normalised by the caller. */
export class AgencyRepo extends Context.Service<
  AgencyRepo,
  {
    findByLicence(normalizedLicence: string): Effect.Effect<ReadonlyArray<Agency>, PersistenceError>
    /** Agencies whose normalised name contains the normalised query. */
    searchByName(normalizedName: string, limit: number): Effect.Effect<ReadonlyArray<Agency>, PersistenceError>
  }
>()("@dadalink/ports/AgencyRepo") {}
