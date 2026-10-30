import type { ContentId, Country, Locale, ReviewStatus } from "@dadalink/domain"
import { Context, type Effect } from "effect"
import type { PersistenceError } from "./errors.ts"

export interface RetrievalQuery {
  readonly text: string
  /** Preferred locale; implementations also search English as a fallback. */
  readonly locale: Locale
  readonly country?: Country
  readonly limit: number
  /** When true only `reviewed` translations are eligible. */
  readonly reviewedOnly: boolean
}

export interface Passage {
  readonly contentId: ContentId
  readonly locale: Locale
  readonly status: ReviewStatus
  readonly title: string
  readonly text: string
  /** Higher is more relevant. Only comparable within one result set. */
  readonly score: number
}

/** Lexical retrieval over the content catalogue (FTS5 or in-process BM25). */
export class Retriever extends Context.Service<
  Retriever,
  {
    retrieve(query: RetrievalQuery): Effect.Effect<ReadonlyArray<Passage>, PersistenceError>
  }
>()("@dadalink/ports/Retriever") {}
