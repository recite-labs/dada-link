import { MemoryFeedbackLog } from "@dadalink/adapters"
import { Api } from "@dadalink/api"
import type { DeviceId } from "@dadalink/domain"
import { DEVICE_ID } from "@dadalink/testing"
import { expect, layer } from "@effect/vitest"
import { Effect, Ref, Stream } from "effect"
import { HttpApiTest } from "effect/http-api"
import { TestServerLayer } from "./layers.ts"

const makeClient = HttpApiTest.groups(Api, ["assistant"])
const deviceId = DEVICE_ID as DeviceId
const otherDevice = "0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01" as DeviceId

layer(TestServerLayer)("HTTP: assistant", (it) => {
  it.effect("POST /assistant/ask answers with citations", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const response = yield* client.assistant.ask({
        payload: { deviceId, locale: "en", question: "My salary was not paid" }
      })
      expect(response.grounded).toBe(true)
      expect(response.citations.map((c) => c.contentId)).toContain("abroad-unpaid-wages")
    })
  )

  it.effect("POST /assistant/ask leads with the emergency notice", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const response = yield* client.assistant.ask({
        payload: { deviceId: otherDevice, locale: "en", country: "SA", question: "He beats me and took my salary" }
      })
      expect(response.emergency?.contacts.map((c) => c.phone)).toEqual(["999", "997"])
      expect(response.answer.startsWith(response.emergency?.message ?? "-")).toBe(true)
    })
  )

  it.effect("POST /assistant/ask/stream streams server-sent events", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const stream = yield* client.assistant.askStream({
        payload: { deviceId: otherDevice, locale: "en", question: "salary not paid" }
      })
      const events = yield* Stream.runCollect(stream)
      expect(events[0]?._tag).toBe("Citations")
      expect(events.at(-1)?._tag).toBe("Done")
    })
  )

  it.effect("returns 429 RateLimited once the daily quota is used", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const payload = { deviceId, locale: "en" as const, question: "salary" }
      yield* client.assistant.ask({ payload })
      yield* client.assistant.ask({ payload })
      const error = yield* Effect.flip(client.assistant.ask({ payload }))
      expect(error._tag).toBe("RateLimited")
    })
  )

  it.effect("POST /assistant/feedback records content-free feedback", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      yield* client.assistant.feedback({
        payload: { helpful: true, locale: "am", contentIds: ["abroad-unpaid-wages"] as never }
      })
      const log = yield* Ref.get(yield* MemoryFeedbackLog)
      expect(log.map((f) => f.helpful)).toEqual([true])
    })
  )

  it.effect("rejects invalid payloads", () =>
    Effect.gen(function* () {
      const client = yield* makeClient
      const error = yield* Effect.flip(
        client.assistant.ask({ payload: { deviceId: "nope" as DeviceId, locale: "en", question: "x" } })
      )
      expect(error._tag).not.toBe("RateLimited")
    })
  )
})
