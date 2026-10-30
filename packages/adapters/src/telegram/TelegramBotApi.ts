import { type InlineButton, MessengerBot, MessengerUnavailable, type OutgoingMessage } from "@dadalink/ports"
import { Config, Effect, Layer, Option, Redacted, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http"
import { DisabledMessengerBot } from "../memory/RecordingMessengerBot.ts"
import { LogOnlyMessengerBot } from "./LogOnlyMessengerBot.ts"

export const DEFAULT_TELEGRAM_API = "https://api.telegram.org"

export interface TelegramBotApiSettings {
  readonly token: Redacted.Redacted<string>
  readonly apiBaseUrl: string
}

const ApiReply = Schema.Struct({ ok: Schema.Boolean, description: Schema.optionalKey(Schema.String) })

const toTelegramButton = (button: InlineButton) =>
  "url" in button ? { text: button.text, url: button.url } : { text: button.text, callback_data: button.callbackData }

/** Body of `sendMessage`. Plain text (no parse mode) so content never needs escaping. */
export const sendMessageBody = (message: OutgoingMessage) => ({
  chat_id: message.chatId,
  text: message.text,
  link_preview_options: { is_disabled: true },
  ...(message.buttons === undefined
    ? {}
    : { reply_markup: { inline_keyboard: message.buttons.map((row) => row.map(toTelegramButton)) } })
})

/**
 * `MessengerBot` over the Telegram Bot API. Errors carry only Telegram's
 * description or the HTTP error tag, never the URL (it contains the token).
 */
export const telegramBotApi = (settings: TelegramBotApiSettings) =>
  Layer.effect(
    MessengerBot,
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient

      const call = (method: string, body: Record<string, unknown>) =>
        HttpClientRequest.post(`${settings.apiBaseUrl}/bot${Redacted.value(settings.token)}/${method}`).pipe(
          HttpClientRequest.bodyJsonUnsafe(body),
          client.execute,
          Effect.flatMap(HttpClientResponse.schemaBodyJson(ApiReply)),
          Effect.mapError((error) => new MessengerUnavailable({ reason: `Telegram ${method} failed (${error._tag})` })),
          Effect.flatMap((reply) =>
            reply.ok
              ? Effect.void
              : Effect.fail(new MessengerUnavailable({ reason: reply.description ?? `Telegram ${method} failed` }))
          ),
          Effect.withSpan(`Telegram.${method}`)
        )

      return MessengerBot.of({
        sendMessage: (message) => call("sendMessage", sendMessageBody(message)),
        answerCallback: (id) => call("answerCallbackQuery", { callback_query_id: id })
      })
    })
  )

/**
 * `DADALINK_MESSENGER_PROVIDER` = `telegram` (default) or `log` (development).
 * Telegram uses `TELEGRAM_BOT_TOKEN` (secret) and optional `TELEGRAM_API_BASE_URL`;
 * without a token the bot is disabled (calls fail with `MessengerUnavailable`).
 */
export const MessengerBotLive = Layer.unwrap(
  Effect.gen(function* () {
    const provider = yield* Config.Literals(["telegram", "log"], "DADALINK_MESSENGER_PROVIDER").pipe(
      Config.withDefault("telegram")
    )
    if (provider === "log") return LogOnlyMessengerBot.layer
    const token = yield* Config.Redacted("TELEGRAM_BOT_TOKEN").pipe(Config.option)
    const apiBaseUrl = yield* Config.String("TELEGRAM_API_BASE_URL").pipe(Config.withDefault(DEFAULT_TELEGRAM_API))
    return Option.match(token, {
      onNone: () => DisabledMessengerBot.layer,
      onSome: (t) => telegramBotApi({ token: t, apiBaseUrl }).pipe(Layer.provide(FetchHttpClient.layer))
    })
  })
)
