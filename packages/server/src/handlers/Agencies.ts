import { Api } from "@dadalink/api"
import { AgencyChecker } from "@dadalink/core"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"

export const AgenciesHandlers = HttpApiBuilder.group(
  Api,
  "agencies",
  Effect.fn(function* (handlers) {
    const checker = yield* AgencyChecker
    return handlers.handle("check", ({ query }) =>
      checker.check(query.q).pipe(Effect.catchTag("PersistenceError", Effect.die))
    )
  })
)
