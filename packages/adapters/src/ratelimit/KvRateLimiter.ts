import { PersistenceError, RateLimiter } from "@dadalink/ports"
import { Clock, Effect, Layer, Option, Schema } from "effect"

/** The subset of a Workers `KVNamespace` the limiter needs (keeps adapters free of platform types). */
export interface KvStore {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { readonly expirationTtl?: number }): Promise<void>
}

const Window = Schema.fromJsonString(Schema.Struct({ startMs: Schema.Number, count: Schema.Int }))
const decodeWindow = Schema.decodeUnknownOption(Window)
const encodeWindow = Schema.encodeSync(Window)

/** KV requires TTLs of at least 60 seconds. */
const MIN_TTL_SECONDS = 60

/**
 * Fixed-window limiter on Workers KV. KV is eventually consistent, so limits
 * are approximate under concurrent bursts; acceptable for abuse protection.
 */
export const KvRateLimiter = {
  layer: (kv: KvStore) =>
    Layer.succeed(
      RateLimiter,
      RateLimiter.of({
        consume: (request) =>
          Effect.gen(function* () {
            const now = yield* Clock.currentTimeMillis
            const windowMs = request.windowSeconds * 1000
            const key = `ratelimit:${request.key}`
            const raw = yield* Effect.tryPromise(() => kv.get(key))
            const current = raw === null ? undefined : Option.getOrUndefined(decodeWindow(raw))
            const next =
              current === undefined || current.startMs <= now - windowMs
                ? { startMs: now, count: 1 }
                : { startMs: current.startMs, count: current.count + 1 }
            const remainingMs = next.startMs + windowMs - now
            yield* Effect.tryPromise(() =>
              kv.put(key, encodeWindow(next), {
                expirationTtl: Math.max(MIN_TTL_SECONDS, Math.ceil(remainingMs / 1000))
              })
            )
            const allowed = next.count <= request.limit
            return {
              allowed,
              remaining: Math.max(0, request.limit - next.count),
              retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil(remainingMs / 1000))
            }
          }).pipe(Effect.mapError((cause) => new PersistenceError({ operation: "KvRateLimiter.consume", cause })))
      })
    )
}
