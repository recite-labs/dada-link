import type { KVNamespace } from "@cloudflare/workers-types"
import { KvRateLimiter, LanguageModelLive, MessengerBotLive, SmsSenderLive } from "@dadalink/adapters"
import { AssistantSettings, BotSettings, Pseudonymizer } from "@dadalink/core"
import { RateLimiterDrizzle, StoreRepositoriesLive } from "@dadalink/db"
import { DatabaseD1 } from "@dadalink/db/d1"
import { makeHttpApp, TelegramWebhookSecret } from "@dadalink/server"
import { ConfigProvider, Layer } from "effect"
import { HttpServer } from "effect/http"
import { configRecord, type Env } from "./env.ts"

const rateLimiterFor = (kv: KVNamespace | undefined) =>
  kv === undefined
    ? RateLimiterDrizzle
    : KvRateLimiter.layer({ get: (key) => kv.get(key), put: (k, v, o) => kv.put(k, v, o) })

/**
 * The HTTP app for Workers: D1 for persistence, KV for rate limits (falls back
 * to D1), AI Gateway via `DADALINK_AI_BASE_URL`, config from vars/secrets.
 * `BackgroundTasks` is intentionally left as a per-request requirement.
 */
export const makeWorkerApp = (env: Env) => {
  const persistence = Layer.mergeAll(StoreRepositoriesLive, rateLimiterFor(env.RATE_LIMITS)).pipe(
    Layer.provide(DatabaseD1.layer(env.DB))
  )
  const services = Layer.mergeAll(
    LanguageModelLive,
    SmsSenderLive,
    MessengerBotLive,
    Pseudonymizer.layerConfig,
    AssistantSettings.layerConfig,
    BotSettings.layerConfig,
    TelegramWebhookSecret.layerConfig
  )
  return makeHttpApp().pipe(
    Layer.provide(Layer.mergeAll(persistence, services)),
    Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord(configRecord(env)))),
    Layer.provide(HttpServer.layerServices)
  )
}
