import { COUNTRIES, LOCALES } from "@dadalink/domain"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

/** Telegram chat settings keyed by a salted hash of the chat id. */
export const chatPreferences = sqliteTable("chat_preferences", {
  chatHash: text("chat_hash").primaryKey(),
  locale: text("locale", { enum: LOCALES }).notNull(),
  country: text("country", { enum: COUNTRIES }),
  updatedAtMs: integer("updated_at_ms").notNull()
})
