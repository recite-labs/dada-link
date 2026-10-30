import { RateLimiter, type RateLimitRequest } from "@dadalink/ports"
import { sql } from "drizzle-orm"
import { Clock, Effect, Layer } from "effect"
import { Database } from "../Database.ts"
import { persistence } from "../persistence.ts"
import { rateLimits } from "../schema/index.ts"

/**
 * Fixed-window limiter implemented as one atomic upsert: the window resets
 * when it has elapsed, otherwise the counter increments. Denied attempts also
 * count, which is harmless because the window still expires on time.
 */
export const RateLimiterDrizzle = Layer.effect(
  RateLimiter,
  Effect.gen(function* () {
    const db = yield* Database

    const consume = Effect.fn("RateLimiter.consume")((request: RateLimitRequest) =>
      Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis
        const windowMs = request.windowSeconds * 1000
        const expired = sql`${rateLimits.windowStartMs} <= ${now - windowMs}`
        const [row] = yield* db
          .insert(rateLimits)
          .values({ key: request.key, windowStartMs: now, count: 1 })
          .onConflictDoUpdate({
            target: rateLimits.key,
            set: {
              count: sql`CASE WHEN ${expired} THEN 1 ELSE ${rateLimits.count} + 1 END`,
              windowStartMs: sql`CASE WHEN ${expired} THEN ${now} ELSE ${rateLimits.windowStartMs} END`
            }
          })
          .returning({ count: rateLimits.count, windowStartMs: rateLimits.windowStartMs })
        const count = row?.count ?? 1
        const windowStart = row?.windowStartMs ?? now
        const allowed = count <= request.limit
        return {
          allowed,
          remaining: Math.max(0, request.limit - count),
          retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000))
        }
      }).pipe(persistence("RateLimiter.consume"))
    )

    return RateLimiter.of({ consume })
  })
)
