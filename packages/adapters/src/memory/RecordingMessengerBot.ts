import { MessengerBot, MessengerUnavailable, type OutgoingMessage } from "@dadalink/ports"
import { Context, Effect, Layer, Ref } from "effect"

export class SentMessages extends Context.Service<SentMessages, Ref.Ref<ReadonlyArray<OutgoingMessage>>>()(
  "@dadalink/adapters/memory/SentMessages"
) {}

export class AnsweredCallbacks extends Context.Service<AnsweredCallbacks, Ref.Ref<ReadonlyArray<string>>>()(
  "@dadalink/adapters/memory/AnsweredCallbacks"
) {}

/** Fake bot client: records outgoing messages and answered callbacks. */
export const RecordingMessengerBot = {
  layer: (options: { readonly fail?: boolean } = {}) =>
    Layer.effect(
      MessengerBot,
      Effect.gen(function* () {
        const sent = yield* SentMessages
        const answered = yield* AnsweredCallbacks
        const unavailable = Effect.fail(new MessengerUnavailable({ reason: "configured to fail" }))
        return MessengerBot.of({
          sendMessage: (message) =>
            options.fail === true ? unavailable : Ref.update(sent, (all) => [...all, message]),
          answerCallback: (id) => (options.fail === true ? unavailable : Ref.update(answered, (all) => [...all, id]))
        })
      })
    ).pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          Layer.effect(SentMessages, Ref.make<ReadonlyArray<OutgoingMessage>>([])),
          Layer.effect(AnsweredCallbacks, Ref.make<ReadonlyArray<string>>([]))
        )
      )
    )
}

/** Used when no bot token is configured: every call fails, so callers can degrade gracefully. */
export const DisabledMessengerBot = {
  layer: Layer.succeed(
    MessengerBot,
    MessengerBot.of({
      sendMessage: () => Effect.fail(new MessengerUnavailable({ reason: "Telegram bot is not configured" })),
      answerCallback: () => Effect.fail(new MessengerUnavailable({ reason: "Telegram bot is not configured" }))
    })
  )
}
