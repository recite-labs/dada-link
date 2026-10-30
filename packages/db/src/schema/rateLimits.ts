import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

/** Fixed-window counters keyed by a pseudonymous (hashed) key. */
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStartMs: integer("window_start_ms").notNull(),
  count: integer("count").notNull()
})
