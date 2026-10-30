import { D1Client } from "@effect/sql-d1"
import { makeWithDefaults } from "drizzle-orm/effect-d1"
import { Effect, Layer } from "effect"
import { Database, type DrizzleDatabase } from "./Database.ts"

/**
 * Cloudflare target: a D1 binding through `@effect/sql-d1`. Migrations are
 * applied with `wrangler d1 migrations apply` (see apps/server-cloudflare).
 */
export const DatabaseD1 = {
  layer: (binding: D1Client.D1ClientConfig["db"]) =>
    Layer.effect(
      Database,
      Effect.map(makeWithDefaults({}), (db) => Database.of(db as unknown as DrizzleDatabase))
    ).pipe(Layer.provide(D1Client.layer({ db: binding })))
}
