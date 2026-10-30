import { SmsSender } from "@dadalink/ports"
import { Effect, Layer, Ref } from "effect"
import { SentSms } from "../memory/RecordingSmsSender.ts"
import { maskPhone } from "./maskPhone.ts"

/**
 * Development sender: never contacts a gateway. Logs the masked recipient and
 * the text so developers can see what would be sent, and keeps the messages
 * in `SentSms`. Do not use in production.
 */
export const LogOnlySmsSender = {
  layer: Layer.effect(
    SmsSender,
    Effect.gen(function* () {
      const sent = yield* SentSms
      return SmsSender.of({
        provider: "log",
        send: (message) =>
          Ref.update(sent, (all) => [...all, message]).pipe(
            Effect.andThen(
              Effect.logInfo("SMS (log only, not sent)").pipe(
                Effect.annotateLogs({ to: maskPhone(message.to), length: message.text.length, text: message.text })
              )
            )
          )
      })
    })
  ).pipe(Layer.provideMerge(SentSms.layer))
}
