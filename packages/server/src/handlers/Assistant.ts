import { Api } from "@dadalink/api"
import { Assistant } from "@dadalink/core"
import { FeedbackRepo } from "@dadalink/ports"
import { Effect } from "effect"
import { HttpApiBuilder } from "effect/http-api"

export const AssistantHandlers = HttpApiBuilder.group(
  Api,
  "assistant",
  Effect.fn(function* (handlers) {
    const assistant = yield* Assistant
    const feedback = yield* FeedbackRepo
    return handlers
      .handle("ask", ({ payload }) => assistant.ask(payload).pipe(Effect.catchTag("PersistenceError", Effect.die)))
      .handle("askStream", ({ payload }) =>
        assistant.askStream(payload).pipe(Effect.catchTag("PersistenceError", Effect.die))
      )
      .handle("feedback", ({ payload }) => feedback.record(payload).pipe(Effect.orDie))
  })
)
