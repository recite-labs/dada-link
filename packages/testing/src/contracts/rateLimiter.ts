import { RateLimiter } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { Effect, type Layer } from "effect"
import { TestClock } from "effect/testing"

/** Behaviour every RateLimiter (memory, SQL, KV) must satisfy. Uses the Effect clock. */
export const rateLimiterContract = (name: string, makeLayer: () => Layer.Layer<RateLimiter, unknown>) => {
  const run = <A, E>(effect: Effect.Effect<A, E, RateLimiter>) => Effect.provide(effect, makeLayer())
  const request = { key: "assistant:abc", limit: 2, windowSeconds: 60 }

  describe(`${name}: RateLimiter`, () => {
    it.effect("allows up to the limit then denies with a retry-after", () =>
      run(
        Effect.gen(function* () {
          const limiter = yield* RateLimiter
          const first = yield* limiter.consume(request)
          expect(first).toEqual({ allowed: true, remaining: 1, retryAfterSeconds: 0 })
          expect((yield* limiter.consume(request)).allowed).toBe(true)
          const denied = yield* limiter.consume(request)
          expect(denied.allowed).toBe(false)
          expect(denied.remaining).toBe(0)
          expect(denied.retryAfterSeconds).toBeGreaterThan(0)
          expect(denied.retryAfterSeconds).toBeLessThanOrEqual(60)
        })
      )
    )

    it.effect("keeps separate counters per key", () =>
      run(
        Effect.gen(function* () {
          const limiter = yield* RateLimiter
          yield* limiter.consume(request)
          yield* limiter.consume(request)
          expect((yield* limiter.consume({ ...request, key: "assistant:other" })).allowed).toBe(true)
        })
      )
    )

    it.effect("resets after the window elapses", () =>
      run(
        Effect.gen(function* () {
          const limiter = yield* RateLimiter
          yield* limiter.consume(request)
          yield* limiter.consume(request)
          expect((yield* limiter.consume(request)).allowed).toBe(false)
          yield* TestClock.adjust("61 seconds")
          expect((yield* limiter.consume(request)).allowed).toBe(true)
        })
      )
    )
  })
}
