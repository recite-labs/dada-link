import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { SqliteClient } from "@effect/sql-sqlite-node"
import { makeWithDefaults } from "drizzle-orm/effect-sqlite-node"
import { migrate } from "drizzle-orm/effect-sqlite-node/migrator"
import { Effect, Layer } from "effect"
import { Database, type DrizzleDatabase } from "./Database.ts"

/** Absolute path of the drizzle-kit migrations shipped with this package. */
export const migrationsFolder = fileURLToPath(new URL("../migrations", import.meta.url))

export interface DatabaseNodeOptions {
  /** SQLite file path (parent folders are created), or `:memory:` for tests. */
  readonly filename: string
  /** Apply pending migrations on start (default `true`). */
  readonly migrate?: boolean
}

/** Self-hosted target: node:sqlite through `@effect/sql-sqlite-node`. */
export const DatabaseNode = {
  layer: (options: DatabaseNodeOptions) =>
    Layer.effect(
      Database,
      Effect.gen(function* () {
        const db = yield* makeWithDefaults()
        if (options.migrate !== false) yield* migrate(db, { migrationsFolder })
        // Both drivers share the same query HKT; only the raw run-result type differs.
        const shared: DrizzleDatabase = db as unknown as DrizzleDatabase
        return Database.of(shared)
      })
    ).pipe(
      Layer.provide(SqliteClient.layer({ filename: options.filename })),
      Layer.provide(ensureParentDirectory(options.filename))
    )
}

const ensureParentDirectory = (filename: string) =>
  Layer.effectDiscard(
    Effect.sync(() => {
      if (filename !== ":memory:" && !filename.startsWith("file:")) mkdirSync(dirname(filename), { recursive: true })
    })
  )
