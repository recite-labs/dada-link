import { MemoryCatalog } from "@dadalink/adapters"
import { CatalogWriter } from "@dadalink/ports"
import { agencies, allContent, lbDirectory, saDirectory } from "@dadalink/testing"
import { Effect, Layer } from "effect"

/** In-memory catalogue pre-loaded with the shared fixtures. */
export const SeededCatalog = Layer.effectDiscard(
  Effect.gen(function* () {
    const writer = yield* CatalogWriter
    yield* writer.replaceContent(allContent)
    yield* writer.replaceDirectory("SA", saDirectory)
    yield* writer.replaceDirectory("LB", lbDirectory)
    yield* writer.replaceAgencies(agencies)
  })
).pipe(Layer.provideMerge(MemoryCatalog.layer))
