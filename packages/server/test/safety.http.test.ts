import { SentMessages, SentSms } from "@dadalink/adapters"
import { Api } from "@dadalink/api"
import type { DeviceId, E164PhoneNumber, TelegramChatId } from "@dadalink/domain"
import { expect, layer } from "@effect/vitest"
import { Effect, Ref } from "effect"
import { HttpApiTest } from "effect/http-api"
import { TestServerLayer } from "./layers.ts"

const makeClient = HttpApiTest.groups(Api, ["safety"])
const deviceId = "1d1b3a8e-5f7c-4b1a-9c2d-3e4f5a6b7c8d" as DeviceId

layer(TestServerLayer)("HTTP: safety", (it) => {
  it.effect("POST /safety/sos relays by SMS and Telegram", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const result = yield* client.safety.sos({
        payload: {
          deviceId,
          locale: "en",
          trustedContact: { phone: "+251911000000" as E164PhoneNumber, telegramChatId: 99 as TelegramChatId },
          location: { latitude: 33.8938, longitude: 35.5018 }
        }
      })
      expect(result.deliveredVia.toSorted()).toEqual(["sms", "telegram"])
      expect((yield* Ref.get(yield* SentSms))[0]?.text).toContain("maps.google.com")
      expect((yield* Ref.get(yield* SentMessages))[0]?.chatId).toBe(99)
    })
  )

  it.effect("rejects a trusted contact without any channel", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const error = yield* Effect.flip(client.safety.sos({ payload: { deviceId, locale: "en", trustedContact: {} } }))
      expect(error._tag).not.toBe("UpstreamUnavailable")
    })
  )
})
