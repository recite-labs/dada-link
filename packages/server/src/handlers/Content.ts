import { Api } from "@dadalink/api"
import { ContentCatalog } from "@dadalink/core"
import { FALLBACK_LOCALE } from "@dadalink/domain"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"

export const ContentHandlers = HttpApiBuilder.group(
  Api,
  "content",
  Effect.fn(function* (handlers) {
    const catalog = yield* ContentCatalog
    return handlers
      .handle("list", ({ query: { locale, ...filter } }) =>
        catalog.list({ locale: locale ?? FALLBACK_LOCALE, ...filter }).pipe(Effect.orDie)
      )
      .handle("get", ({ params, query }) =>
        catalog.get(params.id, query.locale ?? FALLBACK_LOCALE).pipe(Effect.catchTag("PersistenceError", Effect.die))
      )
  })
)
