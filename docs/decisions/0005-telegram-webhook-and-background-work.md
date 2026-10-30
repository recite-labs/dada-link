# 0005 — Telegram webhook: verified, acknowledged fast, processed in the background

Status: accepted (2026-10-31)

## Context

Telegram retries webhooks that are slow or fail, which would duplicate answers. Answering a question can take seconds (retrieval + model). Workers must keep work alive with `ctx.waitUntil`; Node can simply fork a fiber. Chat ids identify people and must not be stored.

## Decision

- `POST /telegram/webhook` requires `X-Telegram-Bot-Api-Secret-Token` to equal `TELEGRAM_WEBHOOK_SECRET` (constant-time comparison). Without a configured secret every call is rejected (401).
- The handler only verifies and hands `BotService.handleUpdate(update)` to the `BackgroundTasks` port, then returns 204. `handleUpdate` never fails; errors are logged with the update id only.
- `BackgroundTasks` is resolved **per request** inside the handler, which makes it a request-level requirement of the HTTP app:
  - Node: `HttpRouter.provideRequest(DetachedBackgroundTasks.layer)` (detached fiber).
  - Workers: not provided in the layer; the Worker passes `waitUntilBackgroundTasks(ctx.waitUntil)` in the per-request context of `HttpRouter.toWebHandler`.
  - Tests: `InlineBackgroundTasks` (runs before returning). `HttpApiTest` bypasses router middleware, so in that harness the service is provided to the calling effect.
- Bot replies go through the `MessengerBot` port (`sendMessage` with inline keyboards, `answerCallbackQuery`), implemented by the Bot API adapter (plain text, link previews disabled; errors never include the token-bearing URL). `DADALINK_MESSENGER_PROVIDER=log` logs instead of sending (development).
- Per-chat settings (locale, country) are stored in `chat_preferences` keyed by `sha256(salt:telegram-chat:<id>)`; the assistant quota for the bot uses the same pseudonymous subject (`Assistant.askAs`).

## Consequences

The same server package runs unchanged on both targets; only the composition root decides how background work is kept alive.
