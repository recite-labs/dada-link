import { PREFIX_MIN_LENGTH } from "@dadalink/domain"

export interface Bm25Document<F extends string> {
  readonly id: string
  readonly fields: Readonly<Record<F, string>>
}

export interface Bm25Hit {
  readonly id: string
  readonly score: number
}

const K1 = 1.2
const B = 0.75

interface IndexedField {
  readonly tokens: ReadonlyArray<string>
}

const tokenizeField = (text: string): ReadonlyArray<string> =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []

const matches = (term: string, token: string) =>
  term.length >= PREFIX_MIN_LENGTH ? token.startsWith(term) : token === term

/**
 * Small field-weighted BM25 (BM25F-style sum) used when FTS5 is unavailable
 * and by in-memory test adapters. Query terms of 3+ characters match token
 * prefixes, mirroring the FTS5 query builder.
 */
export class Bm25Index<F extends string> {
  private readonly docs: ReadonlyArray<{ readonly id: string; readonly fields: Record<F, IndexedField> }>
  private readonly weights: Readonly<Record<F, number>>
  private readonly avgLength: Readonly<Record<F, number>>

  private constructor(
    docs: ReadonlyArray<{ readonly id: string; readonly fields: Record<F, IndexedField> }>,
    weights: Readonly<Record<F, number>>,
    avgLength: Readonly<Record<F, number>>
  ) {
    this.docs = docs
    this.weights = weights
    this.avgLength = avgLength
  }

  static make<F extends string>(
    documents: ReadonlyArray<Bm25Document<F>>,
    weights: Readonly<Record<F, number>>
  ): Bm25Index<F> {
    const fieldNames = Object.keys(weights) as Array<F>
    const docs = documents.map((d) => ({
      id: d.id,
      fields: Object.fromEntries(fieldNames.map((f) => [f, { tokens: tokenizeField(d.fields[f]) }])) as Record<
        F,
        IndexedField
      >
    }))
    const avgLength = Object.fromEntries(
      fieldNames.map((f) => [
        f,
        docs.length === 0 ? 0 : docs.reduce((sum, d) => sum + d.fields[f].tokens.length, 0) / docs.length
      ])
    ) as Record<F, number>
    return new Bm25Index(docs, weights, avgLength)
  }

  /** Ranks documents for already-tokenised query terms (see `searchTerms`). */
  search(terms: ReadonlyArray<string>): ReadonlyArray<Bm25Hit> {
    const n = this.docs.length
    if (n === 0 || terms.length === 0) return []
    const fieldNames = Object.keys(this.weights) as Array<F>
    const scores = new Map<string, number>()
    for (const term of terms) {
      const df = this.docs.filter((d) =>
        fieldNames.some((f) => d.fields[f].tokens.some((t) => matches(term, t)))
      ).length
      if (df === 0) continue
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
      for (const doc of this.docs) {
        let weightedTf = 0
        for (const f of fieldNames) {
          const tokens = doc.fields[f].tokens
          const tf = tokens.filter((t) => matches(term, t)).length
          if (tf === 0) continue
          const avg = this.avgLength[f] || 1
          weightedTf += (this.weights[f] * tf) / (1 - B + (B * tokens.length) / avg)
        }
        if (weightedTf > 0) {
          scores.set(doc.id, (scores.get(doc.id) ?? 0) + (idf * (weightedTf * (K1 + 1))) / (weightedTf + K1))
        }
      }
    }
    return [...scores.entries()].map(([id, score]) => ({ id, score })).toSorted((a, b) => b.score - a.score)
  }
}
