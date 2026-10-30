import { Api, TELEGRAM_SECRET_HEADER, WebhookUnauthorized } from "@dadalink/api"
import { BotService } from "@dadalink/core"
import { BackgroundTasks } from "@dadalink/ports"
import { Effect, Redacted } from "effect"
import { HttpApiBuilder } from "effect/http-api"
import { isAuthorizedWebhook, TelegramWebhookSecret } from "../telegram/TelegramWebhookSecret.ts"

export const TelegramHandlers = HttpApiBuilder.group(
  Api,
  "telegram",
  Effect.fn(function* (handlers) {
    const bot = yield* BotService
    const secret = yield* TelegramWebhookSecret
    return handlers.handle(
      "webhook",
      Effect.fn("TelegramWebhook")(function* ({ headers, payload }) {
        if (!isAuthorizedWebhook(secret, headers[TELEGRAM_SECRET_HEADER], Redacted.value)) {
          return yield* new WebhookUnauthorized()
        }
        // Acknowledge fast; Telegram retries slow or failed webhooks.
        const tasks = yield* BackgroundTasks
        yield* tasks.run(bot.handleUpdate(payload))
      })
    )
  })
)
