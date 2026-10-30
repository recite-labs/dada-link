import { InlineBackgroundTasks, SentMessages } from "@dadalink/adapters"
import { Api } from "@dadalink/api"
import type { TelegramUpdate } from "@dadalink/domain"
import { describe, expect, it, layer } from "@effect/vitest"
import { Effect, Ref } from "effect"
import { HttpApiTest } from "effect/http-api"
import { constantTimeEqual } from "../src/index.ts"
import { TestServerLayer, WEBHOOK_SECRET } from "./layers.ts"

const makeClient = HttpApiTest.groups(Api, ["telegram"])

const start: TelegramUpdate = {
  update_id: 1,
  message: { message_id: 1, chat: { id: 777 as never }, from: { language_code: "en" }, text: "/start" }
}

layer(TestServerLayer)("HTTP: telegram webhook", (it) => {
  it.effect("rejects calls without the secret header and does nothing", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const missing = yield* Effect.flip(client.telegram.webhook({ headers: {}, payload: start }))
      expect(missing._tag).toBe("WebhookUnauthorized")
      const wrong = yield* Effect.flip(
        client.telegram.webhook({ headers: { "x-telegram-bot-api-secret-token": "guess" }, payload: start })
      )
      expect(wrong._tag).toBe("WebhookUnauthorized")
      expect(yield* Ref.get(yield* SentMessages)).toEqual([])
    })
  )

  it.effect("accepts verified updates and replies through the bot", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      yield* client.telegram.webhook({ headers: { "x-telegram-bot-api-secret-token": WEBHOOK_SECRET }, payload: start })
      const sent = yield* Ref.get(yield* SentMessages)
      expect(sent.at(-1)?.chatId).toBe(777)
      expect(sent.at(-1)?.text).toContain("Dada")
    }).pipe(Effect.provide(InlineBackgroundTasks.layer))
  )
})

describe("constantTimeEqual", () => {
  it("compares strings of equal and different lengths", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true)
    expect(constantTimeEqual("abc", "abd")).toBe(false)
    expect(constantTimeEqual("abc", "abcd")).toBe(false)
    expect(constantTimeEqual("", "")).toBe(true)
  })
})
