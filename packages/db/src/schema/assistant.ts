import type { ContentId } from "@dadalink/domain"
import { LOCALES } from "@dadalink/domain"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

/**
 * Opt-in assistant feedback. Deliberately contains no question/answer text,
 * no device id and only a day-precision date.
 */
export const assistantFeedback = sqliteTable("assistant_feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  day: text("day").notNull(),
  helpful: integer("helpful", { mode: "boolean" }).notNull(),
  locale: text("locale", { enum: LOCALES }).notNull(),
  contentIds: text("content_ids", { mode: "json" }).$type<ReadonlyArray<ContentId>>().notNull()
})
