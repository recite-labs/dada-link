import { FakeLanguageModel } from "@dadalink/adapters"
import { Api } from "@dadalink/api"
import { AssistantSettings, Pseudonymizer } from "@dadalink/core"
import { CatalogWriter } from "@dadalink/ports"
import { makeHttpApp } from "@dadalink/server"
import { agencies, allContent, saDirectory } from "@dadalink/testing"
import { NodeHttpServer } from "@effect/platform-node"
import { expect, layer } from "@effect/vitest"
import { Effect, Layer, Redacted } from "effect"
import { HttpRouter } from "effect/http"
import { HttpApiClient } from "effect/http-api"
import { PersistenceLive } from "../src/AppLayer.ts"

const Persistence = PersistenceLive(":memory:")

const Services = Layer.mergeAll(
  FakeLanguageModel.layer(),
  Pseudonymizer.layer(Redacted.make("e2e-salt")),
  AssistantSettings.layer({ reviewedOnly: false, dailyLimit: 5, maxPassages: 3 })
)

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
  Layer.provide(Layer.mergeAll(Persistence, Services)),
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

  it.effect("answers via the assistant with FTS5 retrieval over SQLite", () =>
    Effect.gen(function* () {
      const client = yield* HttpApiClient.make(Api)
      const response = yield* client.assistant.ask({
        payload: {
          deviceId: "6f1c1d2e-8a3b-4c5d-9e6f-7a8b9c0d1e2f" as never,
          locale: "am",
          country: "SA",
          question: "ደሞዝዎን አልተከፈለኝም"
        }
      })
      expect(response.citations.map((c) => c.contentId)).toContain("abroad-unpaid-wages")
    })
  )
})
