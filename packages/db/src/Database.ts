import type { EffectDrizzleQueryError, QueryEffectHKTBase } from "drizzle-orm/effect-core"
import type { SQLiteEffectDatabase } from "drizzle-orm/sqlite-core/effect"
import { Context } from "effect"

/**
 * Query HKT shared by the `effect-sqlite-node` and `effect-d1` drivers: both
 * fail with `EffectDrizzleQueryError` and need no extra context.
 */
export interface DrizzleQueryHKT extends QueryEffectHKTBase {
  readonly error: EffectDrizzleQueryError
  readonly context: never
}

/** Driver-agnostic Drizzle database over SQLite (node:sqlite or Cloudflare D1). */
export type DrizzleDatabase = SQLiteEffectDatabase<DrizzleQueryHKT, unknown>

export class Database extends Context.Service<Database, DrizzleDatabase>()("@dadalink/db/Database") {}
