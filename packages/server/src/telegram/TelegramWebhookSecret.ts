import { Config, Context, Effect, Layer, Option, type Redacted } from "effect"
import { constantTimeEqual } from "./constantTimeEqual.ts"

/**
 * Shared secret registered with Telegram's `setWebhook(secret_token=...)`.
 * When it is not configured, every webhook call is rejected.
 */
export class TelegramWebhookSecret extends Context.Service<
  TelegramWebhookSecret,
  Option.Option<Redacted.Redacted<string>>
>()("@dadalink/server/TelegramWebhookSecret") {
  static readonly layer = (secret: Option.Option<Redacted.Redacted<string>>) =>
    Layer.succeed(TelegramWebhookSecret, secret)

  /** From `TELEGRAM_WEBHOOK_SECRET` (secret, optional). */
  static readonly layerConfig = Layer.effect(
    TelegramWebhookSecret,
    Effect.gen(function* () {
      return yield* Config.Redacted("TELEGRAM_WEBHOOK_SECRET").pipe(Config.option)
    })
  )
}

/** True only when a secret is configured and the header matches it. */
export const isAuthorizedWebhook = (
  configured: Option.Option<Redacted.Redacted<string>>,
  received: string | undefined,
  reveal: (secret: Redacted.Redacted<string>) => string
): boolean =>
  received !== undefined &&
  Option.match(configured, { onNone: () => false, onSome: (secret) => constantTimeEqual(reveal(secret), received) })
