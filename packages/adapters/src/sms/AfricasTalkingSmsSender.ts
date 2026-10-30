import { SmsDeliveryFailed, type SmsMessage, SmsSender } from "@dadalink/ports"
import { Config, Effect, Layer, Option, Redacted, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http"

export const AFRICASTALKING_LIVE_URL = "https://api.africastalking.com/version1/messaging"
export const AFRICASTALKING_SANDBOX_URL = "https://api.sandbox.africastalking.com/version1/messaging"

/**
 * - `AFRICASTALKING_USERNAME` (use `sandbox` for the sandbox)
 * - `AFRICASTALKING_API_KEY` (secret)
 * - `AFRICASTALKING_SENDER_ID` (optional alphanumeric sender id / short code)
 * - `AFRICASTALKING_SANDBOX` (default false)
 */
export const AfricasTalkingSettings = Config.all({
  username: Config.String("AFRICASTALKING_USERNAME"),
  apiKey: Config.Redacted("AFRICASTALKING_API_KEY"),
  senderId: Config.String("AFRICASTALKING_SENDER_ID").pipe(Config.option),
  sandbox: Config.Boolean("AFRICASTALKING_SANDBOX").pipe(Config.withDefault(false))
})
export type AfricasTalkingSettings = typeof AfricasTalkingSettings extends Config.Config<infer A> ? A : never

const Recipient = Schema.Struct({ status: Schema.String, statusCode: Schema.Number })
const SendResponse = Schema.Struct({
  SMSMessageData: Schema.Struct({ Message: Schema.String, Recipients: Schema.Array(Recipient) })
})

/** Africa's Talking status codes 100 (processed), 101 (sent) and 102 (queued) mean accepted. */
const ACCEPTED = new Set([100, 101, 102])

const failed = (reason: string) => new SmsDeliveryFailed({ provider: "africastalking", reason })

/** SMS through the Africa's Talking bulk messaging HTTP API. Requires an `HttpClient`. */
export const africasTalkingSmsSender = (settings: AfricasTalkingSettings) =>
  Layer.effect(
    SmsSender,
    Effect.gen(function* () {
      const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)
      const url = settings.sandbox ? AFRICASTALKING_SANDBOX_URL : AFRICASTALKING_LIVE_URL

      const send = Effect.fn("AfricasTalking.send")((message: SmsMessage) =>
        HttpClientRequest.post(url).pipe(
          HttpClientRequest.acceptJson,
          HttpClientRequest.setHeader("apiKey", Redacted.value(settings.apiKey)),
          HttpClientRequest.bodyUrlParams({
            username: settings.username,
            to: message.to,
            message: message.text,
            ...Option.match(settings.senderId, { onNone: () => ({}), onSome: (from) => ({ from }) })
          }),
          client.execute,
          Effect.flatMap(HttpClientResponse.schemaBodyJson(SendResponse)),
          Effect.mapError((cause) => failed(cause._tag)),
          Effect.flatMap((response) => {
            const [recipient] = response.SMSMessageData.Recipients
            return recipient !== undefined && ACCEPTED.has(recipient.statusCode)
              ? Effect.void
              : Effect.fail(failed(recipient?.status ?? response.SMSMessageData.Message))
          })
        )
      )

      return SmsSender.of({ provider: "africastalking", send })
    })
  )

export const AfricasTalkingSmsSenderLive = Layer.unwrap(
  Effect.gen(function* () {
    return africasTalkingSmsSender(yield* AfricasTalkingSettings)
  })
).pipe(Layer.provide(FetchHttpClient.layer))
