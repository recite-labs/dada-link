import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { NotFound, RateLimited, UpstreamUnavailable, ValidationFailed } from "../src/index.ts"

describe("domain errors", () => {
  it.effect("are yieldable tagged errors", () =>
    Effect.gen(function* () {
      const failing = Effect.gen(function* () {
        return yield* new NotFound({ entity: "content", id: "x" })
      })
      const error = yield* Effect.flip(failing)
      expect(error._tag).toBe("NotFound")
      expect(error.message).toContain("content")
    })
  )

  it("are serialisable with their schema", () => {
    const e = new RateLimited({ scope: "assistant", retryAfterSeconds: 60 })
    const encoded = Schema.encodeSync(RateLimited)(e)
    expect(encoded).toEqual({ _tag: "RateLimited", scope: "assistant", retryAfterSeconds: 60 })
    expect(new UpstreamUnavailable({ service: "sms" })._tag).toBe("UpstreamUnavailable")
    expect(new ValidationFailed({ reason: "bad" })._tag).toBe("ValidationFailed")
  })
})
