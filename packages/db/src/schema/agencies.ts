import { AGENCY_STATUSES } from "@dadalink/domain"
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const agencies = sqliteTable(
  "agencies",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** `normalizeAgencyName(name)`, used for matching. */
    nameNormalized: text("name_normalized").notNull(),
    licenceNumber: text("licence_number"),
    /** `normalizeLicence(licenceNumber)`, used for matching. */
    licenceNormalized: text("licence_normalized"),
    status: text("status", { enum: AGENCY_STATUSES }).notNull(),
    region: text("region"),
    phone: text("phone"),
    address: text("address"),
    sourceUrl: text("source_url").notNull(),
    verifiedAt: text("verified_at")
  },
  (t) => [index("agencies_licence_idx").on(t.licenceNormalized), index("agencies_name_idx").on(t.nameNormalized)]
)
