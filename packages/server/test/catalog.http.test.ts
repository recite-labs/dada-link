import { Api } from "@dadalink/api"
import type { ContentId } from "@dadalink/domain"
import { expect, layer } from "@effect/vitest"
import { Effect } from "effect"
import { HttpApiTest } from "effect/http-api"
import { TestServerLayer } from "./layers.ts"

const makeClient = HttpApiTest.groups(Api, ["health", "content", "directory", "agencies"])

layer(TestServerLayer)("HTTP: health, content, directory, agencies", (it) => {
  it.effect("GET /health", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const health = yield* client.health()
      expect(health.status).toBe("ok")
      expect(health.service).toBe("dadalink")
    })
  )

  it.effect("GET /content resolves locale and filters", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const all = yield* client.content.list({ query: { locale: "am" } })
      expect(all.find((s) => s.id === "abroad-unpaid-wages")?.locale).toBe("am")
      const before = yield* client.content.list({ query: { phase: "before" } })
      expect(before.map((s) => s.id)).toEqual(["before-contraception"])
      expect(before[0]?.locale).toBe("en")
    })
  )

  it.effect("GET /content/:id returns the localised item or 404", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const item = yield* client.content.get({ params: { id: "rights-sa" as ContentId }, query: { locale: "ti" } })
      expect(item.title).toBe("Your rights in Saudi Arabia")
      expect(item.requestedLocale).toBe("ti")
      const error = yield* Effect.flip(client.content.get({ params: { id: "missing" as ContentId }, query: {} }))
      expect(error._tag).toBe("NotFound")
    })
  )

  it.effect("GET /directory/:country and /directory/:country/emergency", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const entries = yield* client.directory.forCountry({ params: { country: "SA" } })
      expect(entries.map((e) => e.id)).toEqual(["sa-police", "sa-ambulance", "sa-ethiopian-embassy"])
      const emergency = yield* client.directory.emergency({ params: { country: "SA" }, query: { locale: "am" } })
      expect(emergency.map((c) => c.phone)).toEqual(["999", "997"])
      expect(emergency[0]?.name).toBe("ፖሊስ")
    })
  )

  it.effect("GET /agencies/check", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const result = yield* client.agencies.check({ query: { q: "MoLS/OEA/001/2024" } })
      expect(result.verdict).toBe("licensed")
      const error = yield* Effect.flip(client.agencies.check({ query: { q: "a" } }))
      expect(error._tag).toBe("ValidationFailed")
    })
  )
})
