import { MemoryCatalog } from "@dadalink/adapters"
import { CatalogWriter } from "@dadalink/ports"
import { agencies, allContent, lbDirectory, saDirectory } from "@dadalink/testing"
import { Effect, Layer } from "effect"
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

/** Handlers wired to seeded in-memory adapters plus the HTTP platform services. */
export const TestServerLayer = Layer.mergeAll(HandlersLive, HttpServer.layerServices).pipe(
  Layer.provideMerge(SeededCatalog)
)
