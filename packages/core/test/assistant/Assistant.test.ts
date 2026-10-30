import { FakeLanguageModel, FakeModelCalls, MemoryRateLimiter } from "@dadalink/adapters"
import { AskRequest } from "@dadalink/domain"
import { RateLimiter, type RateLimitRequest } from "@dadalink/ports"
import { DEVICE_ID } from "@dadalink/testing"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Redacted, Ref, Schema, Stream } from "effect"
import { Assistant, AssistantSettings, HelpDirectory, Pseudonymizer } from "../../src/index.ts"
import { SeededCatalog } from "../seed.ts"

const ask = (fields: Record<string, unknown>) =>
  Schema.decodeUnknownSync(AskRequest)({ deviceId: DEVICE_ID, locale: "en", ...fields })

const settings = (overrides: Partial<AssistantSettings["Service"]> = {}) =>
  AssistantSettings.layer({ reviewedOnly: false, dailyLimit: 10, maxPassages: 3, ...overrides })

const makeLayer = (options: {
  readonly model?: Parameters<typeof FakeLanguageModel.layer>[0]
  readonly settings?: Partial<AssistantSettings["Service"]>
  readonly rateLimiter?: Layer.Layer<RateLimiter>
}) =>
  Assistant.layer.pipe(
    Layer.provide(HelpDirectory.layer),
    Layer.provideMerge(FakeLanguageModel.layer(options.model)),
    Layer.provide(settings(options.settings)),
    Layer.provide(options.rateLimiter ?? MemoryRateLimiter.layer),
    Layer.provide(Pseudonymizer.layer(Redacted.make("test-salt"))),
    Layer.provideMerge(SeededCatalog)
  )

const systemPromptOf = (calls: ReadonlyArray<{ readonly system: string; readonly user: string }>) =>
  calls[0]?.system ?? ""

describe("Assistant.ask", () => {
  it.effect("answers from retrieved content with citations and a grounded flag", () =>
    Effect.gen(function* () {
      const response = yield* (yield* Assistant).ask(ask({ question: "My employer did not pay my salary" }))
      expect(response.grounded).toBe(true)
      expect(response.emergency).toBeNull()
      expect(response.citations[0]?.contentId).toBe("abroad-unpaid-wages")
      expect(response.answer).toContain("[1]")
      const calls = yield* Ref.get(yield* FakeModelCalls)
      expect(calls).toHaveLength(1)
      expect(systemPromptOf(calls)).toContain("When your salary is not paid")
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("redacts identifiers before the question reaches the model", () =>
    Effect.gen(function* () {
      yield* (yield* Assistant).ask(ask({ question: "My salary is not paid, call me on +966551234567" }))
      const calls = yield* Ref.get(yield* FakeModelCalls)
      expect(calls[0]?.user).not.toContain("966551234567")
      expect(calls[0]?.user).toContain("[phone]")
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("returns a localised fallback without calling the model when nothing relevant is found", () =>
    Effect.gen(function* () {
      const response = yield* (yield* Assistant).ask(ask({ locale: "sw", question: "zzqx" }))
      expect(response.grounded).toBe(false)
      expect(response.citations).toEqual([])
      expect(response.locale).toBe("sw")
      expect(response.answer).toMatch(/Samahani/)
      expect(yield* Ref.get(yield* FakeModelCalls)).toEqual([])
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("only uses reviewed translations when configured", () =>
    Effect.gen(function* () {
      const response = yield* (yield* Assistant).ask(ask({ question: "contraception implant" }))
      expect(response.grounded).toBe(false)
    }).pipe(Effect.provide(makeLayer({ settings: { reviewedOnly: true } })))
  )

  it.effect("leads with SOS and the country's emergency numbers when danger is detected", () =>
    Effect.gen(function* () {
      const response = yield* (yield* Assistant).ask(
        ask({ locale: "am", country: "SA", question: "My madam beats me and I was not paid my salary" })
      )
      expect(response.emergency?.categories).toEqual(["violence"])
      expect(response.emergency?.contacts.map((c) => c.phone)).toEqual(["999", "997"])
      const firstLine = response.answer.split("\n")[0] ?? ""
      expect(firstLine).toContain("SOS")
      expect(firstLine).toContain("999")
      expect(systemPromptOf(yield* Ref.get(yield* FakeModelCalls))).toMatch(/emergency line/i)
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("still leads with SOS when no content matches and the country is unknown", () =>
    Effect.gen(function* () {
      const response = yield* (yield* Assistant).ask(ask({ question: "I want to kill myself" }))
      expect(response.emergency?.categories).toContain("suicidal")
      expect(response.emergency?.contacts).toEqual([])
      expect(response.answer.split("\n")[0]).toContain("SOS")
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("enforces the daily quota per device with a pseudonymous key", () =>
    Effect.gen(function* () {
      const assistant = yield* Assistant
      yield* assistant.ask(ask({ question: "salary" }))
      yield* assistant.ask(ask({ question: "salary" }))
      const error = yield* Effect.flip(assistant.ask(ask({ question: "salary" })))
      expect(error._tag).toBe("RateLimited")
    }).pipe(Effect.provide(makeLayer({ settings: { dailyLimit: 2 } })))
  )

  it.effect("never passes the raw device id to the rate limiter", () => {
    const keys: Array<string> = []
    const spy = Layer.succeed(
      RateLimiter,
      RateLimiter.of({
        consume: (request: RateLimitRequest) =>
          Effect.sync(() => {
            keys.push(request.key)
            return { allowed: true, remaining: 1, retryAfterSeconds: 0 }
          })
      })
    )
    return Effect.gen(function* () {
      yield* (yield* Assistant).ask(ask({ question: "salary" }))
      expect(keys).toHaveLength(1)
      expect(keys[0]).toMatch(/^assistant:[0-9a-f]{64}$/)
      expect(keys[0]).not.toContain(DEVICE_ID)
    }).pipe(Effect.provide(makeLayer({ rateLimiter: spy })))
  })

  it.effect("maps model failures to UpstreamUnavailable", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* Assistant).ask(ask({ question: "salary" })))
      expect(error._tag).toBe("UpstreamUnavailable")
    }).pipe(Effect.provide(makeLayer({ model: { fail: true } })))
  )
})

describe("Assistant.askStream", () => {
  it.effect("emits citations, text deltas and done, in order", () =>
    Effect.gen(function* () {
      const stream = yield* (yield* Assistant).askStream(ask({ question: "salary not paid" }))
      const events = yield* Stream.runCollect(stream)
      const tags = events.map((e) => e._tag)
      expect(tags[0]).toBe("Citations")
      expect(tags.at(-1)).toBe("Done")
      const text = events.flatMap((e) => (e._tag === "Delta" ? [e.text] : [])).join("")
      expect(text).toContain("[1]")
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("emits the emergency notice first", () =>
    Effect.gen(function* () {
      const stream = yield* (yield* Assistant).askStream(
        ask({ country: "SA", question: "he will kill me, my salary is not paid" })
      )
      const events = yield* Stream.runCollect(stream)
      expect(events[0]?._tag).toBe("Emergency")
    }).pipe(Effect.provide(makeLayer({})))
  )

  it.effect("checks the quota before streaming starts", () =>
    Effect.gen(function* () {
      const assistant = yield* Assistant
      yield* assistant.askStream(ask({ question: "salary" }))
      const error = yield* Effect.flip(assistant.askStream(ask({ question: "salary" })))
      expect(error._tag).toBe("RateLimited")
    }).pipe(Effect.provide(makeLayer({ settings: { dailyLimit: 1 } })))
  )
})
