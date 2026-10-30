import { SmsDeliveryFailed, type SmsMessage, SmsSender } from "@dadalink/ports"
import { Context, Effect, Layer, Ref } from "effect"

/** SMS captured by the recording/log-only senders. */
export class SentSms extends Context.Service<SentSms, Ref.Ref<ReadonlyArray<SmsMessage>>>()(
  "@dadalink/adapters/memory/SentSms"
) {
  static readonly layer = Layer.effect(SentSms, Ref.make<ReadonlyArray<SmsMessage>>([]))
}

/** Test double: records messages, optionally failing every send. */
export const RecordingSmsSender = {
  layer: (options: { readonly fail?: boolean } = {}) =>
    Layer.effect(
      SmsSender,
      Effect.gen(function* () {
        const sent = yield* SentSms
        return SmsSender.of({
          provider: "recording",
          send: (message) =>
            options.fail === true
              ? Effect.fail(new SmsDeliveryFailed({ provider: "recording", reason: "configured to fail" }))
              : Ref.update(sent, (all) => [...all, message])
        })
      })
    ).pipe(Layer.provideMerge(SentSms.layer))
}
