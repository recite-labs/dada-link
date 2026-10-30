import type {
  ContentId,
  ContentKind,
  ContentSummary,
  Country,
  JourneyPhase,
  Locale,
  LocalizedContent,
  Topic
} from "@dadalink/domain"
import { localize, NotFound, summarize } from "@dadalink/domain"
import { ContentRepo, type PersistenceError } from "@dadalink/ports"
import { Context, Effect, Layer, Option } from "effect"

export interface ContentQuery {
  readonly locale: Locale
  readonly country?: Country
  readonly phase?: JourneyPhase
  readonly kind?: ContentKind
  readonly topic?: Topic
}

/** Browsing the reviewed content catalogue in the user's language. */
export class ContentCatalog extends Context.Service<
  ContentCatalog,
  {
    list(query: ContentQuery): Effect.Effect<ReadonlyArray<ContentSummary>, PersistenceError>
    get(id: ContentId, locale: Locale): Effect.Effect<LocalizedContent, NotFound | PersistenceError>
  }
>()("@dadalink/core/ContentCatalog") {
  static readonly layer = Layer.effect(
    ContentCatalog,
    Effect.gen(function* () {
      const repo = yield* ContentRepo

      const list = Effect.fn("ContentCatalog.list")(function* ({ locale, ...filter }: ContentQuery) {
        const items = yield* repo.list(filter)
        return items.flatMap((item) => summarize(item, locale) ?? [])
      })

      const get = Effect.fn("ContentCatalog.get")(function* (id: ContentId, locale: Locale) {
        const item = yield* repo.get(id)
        const localized = Option.flatMapNullishOr(item, (i) => localize(i, locale))
        if (Option.isNone(localized)) return yield* new NotFound({ entity: "content", id })
        return localized.value
      })

      return ContentCatalog.of({ list, get })
    })
  )
}
