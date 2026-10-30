import { Api } from "@dadalink/api"
import { SosRelay } from "@dadalink/core"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"

export const SafetyHandlers = HttpApiBuilder.group(
  Api,
  "safety",
  Effect.fn(function* (handlers) {
    const relay = yield* SosRelay
    return handlers.handle("sos", ({ payload }) =>
      relay.send(payload).pipe(Effect.catchTag("PersistenceError", Effect.die))
    )
  })
)
