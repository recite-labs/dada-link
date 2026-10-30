import { MemoryRateLimiter, RecordingMessengerBot, RecordingSmsSender, SentMessages, SentSms } from "@dadalink/adapters"
import { SosRequest } from "@dadalink/domain"
import { DEVICE_ID } from "@dadalink/testing"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Redacted, Ref, Schema } from "effect"
import { Pseudonymizer, SosRelay } from "../../src/index.ts"

const sos = (fields: Record<string, unknown>) =>
  Schema.decodeUnknownSync(SosRequest)({ deviceId: DEVICE_ID, locale: "en", ...fields })

const makeLayer = (options: { readonly smsFails?: boolean; readonly telegramFails?: boolean } = {}) =>
  SosRelay.layer.pipe(
    Layer.provideMerge(RecordingSmsSender.layer({ fail: options.smsFails ?? false })),
    Layer.provideMerge(RecordingMessengerBot.layer({ fail: options.telegramFails ?? false })),
    Layer.provide(MemoryRateLimiter.layer),
    Layer.provide(Pseudonymizer.layer(Redacted.make("salt")))
  )

describe("SosRelay", () => {
  it.effect("texts the trusted contact with the message and a map link, without any name", () =>
    Effect.gen(function* () {
      const result = yield* (yield* SosRelay).send(
        sos({
          trustedContact: { phone: "+251911000000" },
          message: "Please call the embassy",
          location: { latitude: 24.7136, longitude: 46.6753, accuracyMeters: 20 }
        })
      )
      expect(result.deliveredVia).toEqual(["sms"])
      expect(result.failedVia).toEqual([])
      const [sms] = yield* Ref.get(yield* SentSms)
      expect(sms?.to).toBe("+251911000000")
      expect(sms?.text).toContain("SOS")
      expect(sms?.text).toContain("Please call the embassy")
      expect(sms?.text).toContain("https://maps.google.com/?q=24.7136,46.6753")
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("relays through Telegram when a chat id is given", () =>
    Effect.gen(function* () {
      const result = yield* (yield* SosRelay).send(sos({ trustedContact: { telegramChatId: 4242 } }))
      expect(result.deliveredVia).toEqual(["telegram"])
      const [message] = yield* Ref.get(yield* SentMessages)
      expect(message?.chatId).toBe(4242)
      expect(message?.text).toContain("SOS")
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("uses the requested language for the alert", () =>
    Effect.gen(function* () {
      yield* (yield* SosRelay).send(sos({ locale: "am", trustedContact: { phone: "+251911000000" } }))
      const [sms] = yield* Ref.get(yield* SentSms)
      expect(sms?.text).toMatch(/[ሀ-፿]/u)
    }).pipe(Effect.provide(makeLayer()))
  )

  it.effect("reports partial delivery when one channel fails", () =>
    Effect.gen(function* () {
      const result = yield* (yield* SosRelay).send(
        sos({ trustedContact: { phone: "+251911000000", telegramChatId: 7 } })
      )
      expect(result.deliveredVia).toEqual(["telegram"])
      expect(result.failedVia).toEqual(["sms"])
    }).pipe(Effect.provide(makeLayer({ smsFails: true })))
  )

  it.effect("fails with UpstreamUnavailable when nothing could be delivered (client falls back to native SMS)", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* SosRelay).send(sos({ trustedContact: { phone: "+251911000000" } })))
      expect(error._tag).toBe("UpstreamUnavailable")
    }).pipe(Effect.provide(makeLayer({ smsFails: true })))
  )

  it.effect("limits SOS relays per device per hour", () =>
    Effect.gen(function* () {
      const relay = yield* SosRelay
      const request = sos({ trustedContact: { phone: "+251911000000" } })
      for (let i = 0; i < 5; i++) yield* relay.send(request)
      const error = yield* Effect.flip(relay.send(request))
      expect(error._tag).toBe("RateLimited")
    }).pipe(Effect.provide(makeLayer()))
  )
})
