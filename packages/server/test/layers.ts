import { FakeLanguageModel, MemoryCatalog, MemoryFeedback, MemoryRateLimiter } from "@dadalink/adapters"
import { AssistantSettings, Pseudonymizer } from "@dadalink/core"
import { CatalogWriter } from "@dadalink/ports"
import { agencies, allContent, lbDirectory, saDirectory } from "@dadalink/testing"
import { Effect, Layer, Redacted } from "effect"
import { HttpServer } from "effect/http"
import { HandlersLive } from "../src/index.ts"

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
  Pseudonymizer.layer(Redacted.make("test-salt")),
  AssistantSettings.layer({ reviewedOnly: false, dailyLimit: 3, maxPassages: 3 })
)

/** Handlers wired to in-memory adapters plus the HTTP platform services. */
export const TestServerLayer = Layer.mergeAll(HandlersLive, HttpServer.layerServices).pipe(
  Layer.provideMerge(TestInfrastructure)
)
