import type { LocalizedNames } from "@dadalink/domain"
import { COUNTRIES, DIRECTORY_KINDS } from "@dadalink/domain"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const directoryEntries = sqliteTable(
  "directory_entries",
  {
    id: text("id").primaryKey(),
    country: text("country", { enum: COUNTRIES }).notNull(),
    /** Curated display order within a country. */
    position: integer("position").notNull(),
    kind: text("kind", { enum: DIRECTORY_KINDS }).notNull(),
    name: text("name").notNull(),
    names: text("names", { mode: "json" }).$type<LocalizedNames>().notNull(),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    url: text("url"),
    address: text("address"),
    hours: text("hours"),
    notes: text("notes"),
    emergency: integer("emergency", { mode: "boolean" }).notNull(),
    sourceUrl: text("source_url").notNull(),
    verified: integer("verified", { mode: "boolean" }).notNull(),
    lastVerified: text("last_verified")
  },
  (t) => [index("directory_entries_country_idx").on(t.country, t.position)]
)
