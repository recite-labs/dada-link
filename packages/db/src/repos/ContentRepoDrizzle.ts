import type { ContentId } from "@dadalink/domain"
import { ContentItem, LOCALES } from "@dadalink/domain"
import { type ContentFilter, ContentRepo } from "@dadalink/ports"
import { and, asc, eq, inArray, type SQL, sql } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"
import { Database } from "../Database.ts"
import { decodeRow, persistence } from "../persistence.ts"
import { contentItems, contentTranslations } from "../schema/index.ts"

type ItemRow = typeof contentItems.$inferSelect
type TranslationRow = typeof contentTranslations.$inferSelect

const localeRank = (locale: string) => LOCALES.indexOf(locale as (typeof LOCALES)[number])

/** `true` when the JSON array column is empty or contains `value`. */
export const jsonArrayAllows = (column: typeof contentItems.countries | typeof contentItems.topics, value: string) =>
  sql`(json_array_length(${column}) = 0 OR EXISTS (SELECT 1 FROM json_each(${column}) WHERE value = ${value}))`

const jsonArrayContains = (column: typeof contentItems.topics, value: string) =>
  sql`EXISTS (SELECT 1 FROM json_each(${column}) WHERE value = ${value})`

const filterConditions = (filter: ContentFilter): Array<SQL> => {
  const conditions: Array<SQL> = []
  if (filter.kind !== undefined) conditions.push(eq(contentItems.kind, filter.kind))
  if (filter.phase !== undefined) conditions.push(eq(contentItems.phase, filter.phase))
  if (filter.country !== undefined) conditions.push(jsonArrayAllows(contentItems.countries, filter.country))
  if (filter.topic !== undefined) conditions.push(jsonArrayContains(contentItems.topics, filter.topic))
  return conditions
}

const assemble = (items: ReadonlyArray<ItemRow>, translations: ReadonlyArray<TranslationRow>) =>
  Effect.forEach(items, (item) =>
    decodeRow(
      ContentItem,
      "ContentRepo.decode"
    )({
      ...item,
      translations: translations
        .filter((t) => t.contentId === item.id)
        .toSorted((a, b) => localeRank(a.locale) - localeRank(b.locale))
        .map(({ contentId: _, ...t }) => t)
    })
  )

export const ContentRepoDrizzle = Layer.effect(
  ContentRepo,
  Effect.gen(function* () {
    const db = yield* Database

    const load = (conditions: ReadonlyArray<SQL>) =>
      Effect.gen(function* () {
        const items = yield* db
          .select()
          .from(contentItems)
          .where(and(...conditions))
          .orderBy(asc(contentItems.id))
        if (items.length === 0) return []
        const translations = yield* db
          .select()
          .from(contentTranslations)
          .where(
            inArray(
              contentTranslations.contentId,
              items.map((i) => i.id)
            )
          )
        return yield* assemble(items, translations)
      })

    const list = Effect.fn("ContentRepo.list")((filter: ContentFilter) =>
      load(filterConditions(filter)).pipe(persistence("ContentRepo.list"))
    )

    const get = Effect.fn("ContentRepo.get")((id: ContentId) =>
      load([eq(contentItems.id, id)]).pipe(
        Effect.map((items) => Option.fromNullishOr(items[0])),
        persistence("ContentRepo.get")
      )
    )

    return ContentRepo.of({ list, get })
  })
)
