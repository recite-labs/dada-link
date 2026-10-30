import type { ContentId, Country, Source, Topic } from "@dadalink/domain"
import { CONTENT_KINDS, JOURNEY_PHASES, LOCALES, REVIEW_STATUSES } from "@dadalink/domain"
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

/** One reviewed content item; language-specific text lives in `content_translations`. */
export const contentItems = sqliteTable(
  "content_items",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: CONTENT_KINDS }).notNull(),
    phase: text("phase", { enum: JOURNEY_PHASES }),
    countries: text("countries", { mode: "json" }).$type<ReadonlyArray<Country>>().notNull(),
    topics: text("topics", { mode: "json" }).$type<ReadonlyArray<Topic>>().notNull(),
    sources: text("sources", { mode: "json" })
      .$type<ReadonlyArray<Pick<Source, "title" | "url" | "publisher" | "accessed">>>()
      .notNull(),
    sensitive: integer("sensitive", { mode: "boolean" }).notNull().default(false),
    related: text("related", { mode: "json" }).$type<ReadonlyArray<ContentId>>().notNull().default([]),
    updated: text("updated")
  },
  (t) => [index("content_items_phase_idx").on(t.phase), index("content_items_kind_idx").on(t.kind)]
)

/**
 * Per-locale text. The `content_fts` FTS5 index (custom migration) is kept in
 * sync with this table by triggers.
 */
export const contentTranslations = sqliteTable(
  "content_translations",
  {
    contentId: text("content_id")
      .notNull()
      .references(() => contentItems.id, { onDelete: "cascade" }),
    locale: text("locale", { enum: LOCALES }).notNull(),
    status: text("status", { enum: REVIEW_STATUSES }).notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull()
  },
  (t) => [primaryKey({ columns: [t.contentId, t.locale] })]
)
