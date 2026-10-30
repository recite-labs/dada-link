import type { ContentId, ContentItem, ContentKind, Country, JourneyPhase, Topic } from "@dadalink/domain"
import { Context, type Effect, type Option } from "effect"
import type { PersistenceError } from "./errors.ts"

export interface ContentFilter {
  readonly kind?: ContentKind
  readonly phase?: JourneyPhase
  /** Items with no country restriction always match. */
  readonly country?: Country
  readonly topic?: Topic
}

/** Read side of the reviewed content catalogue. */
export class ContentRepo extends Context.Service<
  ContentRepo,
  {
    list(filter: ContentFilter): Effect.Effect<ReadonlyArray<ContentItem>, PersistenceError>
    get(id: ContentId): Effect.Effect<Option.Option<ContentItem>, PersistenceError>
  }
>()("@dadalink/ports/ContentRepo") {}
