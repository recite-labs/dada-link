import { Api } from "@dadalink/api"
import { CatalogWriter } from "@dadalink/ports"
import { makeHttpApp } from "@dadalink/server"
import { agencies, allContent, saDirectory } from "@dadalink/testing"
import { NodeHttpServer } from "@effect/platform-node"
import { expect, layer } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { HttpRouter } from "effect/http"
import { HttpApiClient } from "effect/http-api"
import { PersistenceLive } from "../src/AppLayer.ts"

const Persistence = PersistenceLive(":memory:")

const Seed = Layer.effectDiscard(
  Effect.gen(function* () {
    const writer = yield* CatalogWriter
    yield* writer.replaceContent(allContent)
    yield* writer.replaceDirectory("SA", saDirectory)
    yield* writer.replaceAgencies(agencies)
  })
)

/** Real Node HTTP server on a random port, real SQLite (in memory), real HTTP client. */
const ServerUnderTest = HttpRouter.serve(makeHttpApp()).pipe(
  Layer.provide(Seed),
  Layer.provideMerge(NodeHttpServer.layerTest),
  Layer.provide(Persistence),
  Layer.orDie
)

layer(ServerUnderTest)("server-node e2e (HTTP + SQLite)", (it) => {
  it.effect("serves health, content, directory and agencies over HTTP", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(Api)
      expect((yield* client.health()).status).toBe("ok")
      const content = yield* client.content.list({ query: { locale: "am", country: "SA" } })
      expect(content.map((c) => c.id).toSorted()).toEqual(["abroad-unpaid-wages", "before-contraception", "rights-sa"])
      const emergency = yield* client.directory.emergency({ params: { country: "SA" }, query: {} })
      expect(emergency.map((c) => c.phone)).toEqual(["999", "997"])
      const check = yield* client.agencies.check({ query: { q: "selam overseas" } })
      expect(check.verdict).toBe("licensed")
    })
  )
})
