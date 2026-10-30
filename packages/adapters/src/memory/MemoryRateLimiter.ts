import { RateLimiter } from "@dadalink/ports"
import { Clock, Effect, Layer, Ref } from "effect"

interface Window {
  readonly startMs: number
  readonly count: number
}

/** Fixed-window limiter for tests and single-process deployments. */
export const MemoryRateLimiter = {
  layer: Layer.effect(
    RateLimiter,
    Effect.gen(function* () {
      const windows = yield* Ref.make(new Map<string, Window>())
      return RateLimiter.of({
        consume: (request) =>
          Effect.gen(function* () {
            const now = yield* Clock.currentTimeMillis
            const windowMs = request.windowSeconds * 1000
            const current = yield* Ref.modify(windows, (map) => {
              const existing = map.get(request.key)
              const next: Window =
                existing === undefined || existing.startMs <= now - windowMs
                  ? { startMs: now, count: 1 }
                  : { startMs: existing.startMs, count: existing.count + 1 }
              return [next, new Map(map).set(request.key, next)]
            })
            const allowed = current.count <= request.limit
            return {
              allowed,
              remaining: Math.max(0, request.limit - current.count),
              retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((current.startMs + windowMs - now) / 1000))
            }
          })
      })
    })
  )
}
