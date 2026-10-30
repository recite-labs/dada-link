import { type ContentId, FALLBACK_LOCALE, Locale, ReviewStatus } from "@dadalink/domain"
import { type Passage, type RetrievalQuery, Retriever } from "@dadalink/ports"
import { sql } from "drizzle-orm"
import { Effect, Layer, Schema } from "effect"
import { Database } from "../Database.ts"
import { decodeRow, persistence } from "../persistence.ts"
import { contentItems } from "../schema/index.ts"
import { jsonArrayAllows } from "./ContentRepoDrizzle.ts"
import { toFtsMatch } from "./ftsQuery.ts"

const PassageRow = Schema.Struct({
  contentId: Schema.String,
  locale: Locale,
  status: ReviewStatus,
  title: Schema.String,
  text: Schema.String,
  rank: Schema.Number
})

/** Over-fetch so de-duplication across locales still fills the limit. */
const OVERFETCH = 3

/**
 * FTS5 retriever. Ranks with BM25 weighting title > summary > body, restricts
 * to the user's locale plus English, and keeps one passage per content item
 * (preferring the user's locale).
 */
export const RetrieverFts = Layer.effect(
  Retriever,
  Effect.gen(function* () {
    const db = yield* Database
    const decode = decodeRow(Schema.Array(PassageRow), "Retriever.decode")

    const retrieve = Effect.fn("Retriever.retrieve")((query: RetrievalQuery) =>
      Effect.gen(function* () {
        const match = toFtsMatch(query.text)
        if (match === undefined) return []
        const statusFilter = query.reviewedOnly ? sql`AND f.status = 'reviewed'` : sql``
        const countryFilter =
          query.country === undefined ? sql`` : sql`AND ${jsonArrayAllows(contentItems.countries, query.country)}`
        const rows = yield* db.all(sql`
          SELECT f.content_id AS contentId, f.locale AS locale, f.status AS status, f.title AS title,
                 f.summary || char(10) || char(10) || f.body AS text,
                 bm25(content_fts, 5.0, 2.0, 1.0) AS rank
          FROM content_fts f
          JOIN ${contentItems} ON ${contentItems.id} = f.content_id
          WHERE content_fts MATCH ${match}
            AND f.locale IN (${query.locale}, ${FALLBACK_LOCALE})
            ${statusFilter}
            ${countryFilter}
          ORDER BY rank
          LIMIT ${query.limit * OVERFETCH}
        `)
        const decoded = yield* decode(rows)
        return pickBestPerItem(decoded, query.locale).slice(0, query.limit)
      }).pipe(persistence("Retriever.retrieve"))
    )

    return Retriever.of({ retrieve })
  })
)

const pickBestPerItem = (
  rows: ReadonlyArray<typeof PassageRow.Type>,
  locale: RetrievalQuery["locale"]
): ReadonlyArray<Passage> => {
  const best = new Map<string, Passage>()
  for (const row of rows) {
    const existing = best.get(row.contentId)
    const passage: Passage = {
      contentId: row.contentId as ContentId,
      locale: row.locale,
      status: row.status,
      title: row.title,
      text: row.text,
      score: -row.rank
    }
    if (existing === undefined) best.set(row.contentId, passage)
    else if (existing.locale !== locale && row.locale === locale)
      best.set(row.contentId, { ...passage, score: existing.score })
  }
  return [...best.values()].toSorted((a, b) => b.score - a.score)
}
