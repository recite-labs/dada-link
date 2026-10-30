import type { SosChannel, SosRequest } from "@dadalink/domain"
import { RateLimited, SosResult, UpstreamUnavailable } from "@dadalink/domain"
import { MessengerBot, type PersistenceError, RateLimiter, SmsSender } from "@dadalink/ports"
import { Context, Effect, Layer } from "effect"
import { Pseudonymizer } from "../privacy/Pseudonymizer.ts"
import { buildSosText } from "./sosMessage.ts"

export const SOS_LIMIT_PER_HOUR = 5

/**
 * Relays an SOS to the trusted contact by SMS and/or Telegram. Transient by
 * design: nothing about the alert, the contact or the location is stored or
 * logged. If no channel succeeds the client must fall back to the phone's own SMS.
 */
export class SosRelay extends Context.Service<
  SosRelay,
  {
    send(request: SosRequest): Effect.Effect<SosResult, RateLimited | UpstreamUnavailable | PersistenceError>
  }
>()("@dadalink/core/SosRelay") {
  static readonly layer = Layer.effect(
    SosRelay,
    Effect.gen(function* () {
      const sms = yield* SmsSender
      const bot = yield* MessengerBot
      const rateLimiter = yield* RateLimiter
      const pseudonymizer = yield* Pseudonymizer

      const enforceQuota = Effect.fn("SosRelay.enforceQuota")(function* (request: SosRequest) {
        const key = `sos:${yield* pseudonymizer.hash("device", request.deviceId)}`
        const decision = yield* rateLimiter.consume({ key, limit: SOS_LIMIT_PER_HOUR, windowSeconds: 3600 })
        if (!decision.allowed) {
          return yield* new RateLimited({ scope: "sos", retryAfterSeconds: decision.retryAfterSeconds })
        }
      })

      const attempt = (channel: SosChannel, delivery: Effect.Effect<void, unknown>) =>
        delivery.pipe(
          Effect.as({ channel, ok: true }),
          Effect.catch((error) =>
            Effect.logWarning("SOS delivery failed").pipe(
              Effect.annotateLogs({ channel, error: String(error) }),
              Effect.as({ channel, ok: false })
            )
          )
        )

      const send = Effect.fn("SosRelay.send")(function* (request: SosRequest) {
        yield* enforceQuota(request)
        const text = buildSosText({
          locale: request.locale,
          ...(request.message === undefined ? {} : { message: request.message }),
          ...(request.location === undefined ? {} : { location: request.location })
        })
        const { phone, telegramChatId } = request.trustedContact
        const deliveries = [
          ...(phone === undefined ? [] : [attempt("sms", sms.send({ to: phone, text }))]),
          ...(telegramChatId === undefined
            ? []
            : [attempt("telegram", bot.sendMessage({ chatId: telegramChatId, text }))])
        ]
        const outcomes = yield* Effect.all(deliveries, { concurrency: "unbounded" })
        const deliveredVia = outcomes.filter((o) => o.ok).map((o) => o.channel)
        const failedVia = outcomes.filter((o) => !o.ok).map((o) => o.channel)
        if (deliveredVia.length === 0) return yield* new UpstreamUnavailable({ service: "sos-delivery" })
        return new SosResult({ deliveredVia, failedVia })
      })

      return SosRelay.of({ send })
    })
  )
}
