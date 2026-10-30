import { MessengerBot } from "@dadalink/ports"
import { Effect, Layer, Ref } from "effect"
import { AnsweredCallbacks, SentMessages } from "../memory/RecordingMessengerBot.ts"

/** Development messenger: logs what the bot would send instead of calling Telegram. */
export const LogOnlyMessengerBot = {
  layer: Layer.effect(
    MessengerBot,
    Effect.gen(function* () {
      const sent = yield* SentMessages
      const answered = yield* AnsweredCallbacks
      return MessengerBot.of({
        sendMessage: (message) =>
          Ref.update(sent, (all) => [...all, message]).pipe(
            Effect.andThen(
              Effect.logInfo("Telegram message (log only, not sent)").pipe(
                Effect.annotateLogs({
                  text: message.text,
                  buttons: JSON.stringify(message.buttons ?? [])
                })
              )
            )
          ),
        answerCallback: (id) => Ref.update(answered, (all) => [...all, id])
      })
    })
  ).pipe(Layer.provideMerge(Layer.mergeAll(SentMessages.layer, AnsweredCallbacks.layer)))
}
