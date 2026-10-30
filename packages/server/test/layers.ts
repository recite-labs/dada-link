import {
  FakeLanguageModel,
  InlineBackgroundTasks,
  MemoryCatalog,
  MemoryChatPreferences,
  MemoryFeedback,
  MemoryRateLimiter,
  RecordingMessengerBot,
  RecordingSmsSender
} from "@dadalink/adapters"
import { AssistantSettings, BotSettings, Pseudonymizer } from "@dadalink/core"
import { CatalogWriter } from "@dadalink/ports"
import { agencies, allContent, lbDirectory, saDirectory } from "@dadalink/testing"
import { Effect, Layer, Option, Redacted } from "effect"
import { HttpRouter, HttpServer } from "effect/http"
import { HandlersLive, TelegramWebhookSecret } from "../src/index.ts"

export const WEBHOOK_SECRET = "hook-secret"

export const SeededCatalog = Layer.effectDiscard(
  Effect.gen(function* () {
    const writer = yield* CatalogWriter
    yield* writer.replaceContent(allContent)
    yield* writer.replaceDirectory("SA", saDirectory)
    yield* writer.replaceDirectory("LB", lbDirectory)
    yield* writer.replaceAgencies(agencies)
  })
).pipe(Layer.provideMerge(MemoryCatalog.layer))

/** Adapters and settings every handler needs, all in memory / fake. */
export const TestInfrastructure = Layer.mergeAll(
  SeededCatalog,
  MemoryRateLimiter.layer,
  MemoryFeedback.layer,
  FakeLanguageModel.layer(),
  RecordingSmsSender.layer(),
  RecordingMessengerBot.layer(),
  MemoryChatPreferences.layer,
  BotSettings.layer({ appUrl: "https://example.org/app" }),
  TelegramWebhookSecret.layer(Option.some(Redacted.make(WEBHOOK_SECRET))),
  Pseudonymizer.layer(Redacted.make("test-salt")),
  AssistantSettings.layer({ reviewedOnly: false, dailyLimit: 3, maxPassages: 3 })
)

/** Handlers wired to in-memory adapters plus the HTTP platform services. */
export const TestServerLayer = Layer.mergeAll(
  HandlersLive.pipe(HttpRouter.provideRequest(InlineBackgroundTasks.layer)),
  HttpServer.layerServices
).pipe(Layer.provideMerge(TestInfrastructure))
