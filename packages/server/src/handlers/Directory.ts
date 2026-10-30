import { Api } from "@dadalink/api"
import { HelpDirectory } from "@dadalink/core"
import { FALLBACK_LOCALE } from "@dadalink/domain"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"

export const DirectoryHandlers = HttpApiBuilder.group(
  Api,
  "directory",
  Effect.fn(function* (handlers) {
    const directory = yield* HelpDirectory
    return handlers
      .handle("forCountry", ({ params }) => directory.forCountry(params.country).pipe(Effect.orDie))
      .handle("emergency", ({ params, query }) =>
        directory.emergencyContacts(params.country, query.locale ?? FALLBACK_LOCALE).pipe(Effect.orDie)
      )
  })
)
