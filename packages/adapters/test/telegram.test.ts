import type { TelegramChatId } from "@dadalink/domain"
import { MessengerBot } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Redacted } from "effect"
import { HttpClient, type HttpClientRequest, HttpClientResponse } from "effect/http"
import { MessengerBotLive, telegramBotApi } from "../src/index.ts"

interface Captured {
  readonly url: string
  readonly body: Record<string, unknown>
}

const stubClient = (captured: Array<Captured>, reply: { ok: boolean; description?: string }) =>
  HttpClient.make((request: HttpClientRequest.HttpClientRequest, url) =>
    Effect.sync(() => {
      const body = request.body._tag === "Uint8Array" ? JSON.parse(new TextDecoder().decode(request.body.body)) : {}
      captured.push({ url: url.toString(), body })
      return HttpClientResponse.fromWeb(request, new Response(JSON.stringify(reply), { status: reply.ok ? 200 : 400 }))
    })
  )

const layer = (captured: Array<Captured>, reply: { ok: boolean; description?: string } = { ok: true }) =>
  telegramBotApi({ token: Redacted.make("123:SECRET"), apiBaseUrl: "https://api.telegram.org" }).pipe(
    Layer.provide(Layer.succeed(HttpClient.HttpClient, stubClient(captured, reply)))
  )

describe("Telegram Bot API adapter", () => {
  it.effect("sends messages with an inline keyboard and no link previews", () => {
    const captured: Array<Captured> = []
    return Effect.gen(function* () {
      yield* (yield* MessengerBot).sendMessage({
        chatId: 42 as TelegramChatId,
        text: "Hello",
        buttons: [[{ text: "Help", callbackData: "menu:help" }], [{ text: "App", url: "https://example.org" }]]
      })
      expect(captured[0]?.url).toBe("https://api.telegram.org/bot123:SECRET/sendMessage")
      expect(captured[0]?.body).toEqual({
        chat_id: 42,
        text: "Hello",
        link_preview_options: { is_disabled: true },
        reply_markup: {
          inline_keyboard: [
            [{ text: "Help", callback_data: "menu:help" }],
            [{ text: "App", url: "https://example.org" }]
          ]
        }
      })
    }).pipe(Effect.provide(layer(captured)))
  })

  it.effect("answers callback queries", () => {
    const captured: Array<Captured> = []
    return Effect.gen(function* () {
      yield* (yield* MessengerBot).answerCallback("cb-1")
      expect(captured[0]?.url).toBe("https://api.telegram.org/bot123:SECRET/answerCallbackQuery")
      expect(captured[0]?.body).toEqual({ callback_query_id: "cb-1" })
    }).pipe(Effect.provide(layer(captured)))
  })

  it.effect("fails with MessengerUnavailable without leaking the token", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* MessengerBot).answerCallback("cb-1"))
      expect(error._tag).toBe("MessengerUnavailable")
      expect(JSON.stringify(error)).not.toContain("SECRET")
    }).pipe(Effect.provide(layer([], { ok: false, description: "Bad Request: chat not found" })))
  )

  it.effect("is disabled when no token is configured", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* MessengerBot).answerCallback("x"))
      expect(error.reason).toMatch(/not configured/)
    }).pipe(
      Effect.provide(MessengerBotLive.pipe(Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord({})))))
    )
  )
})
