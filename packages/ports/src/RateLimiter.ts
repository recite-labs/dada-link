import { Context, type Effect } from "effect"
import type { PersistenceError } from "./errors.ts"

export interface RateLimitRequest {
  /** Already pseudonymised key, e.g. `assistant:<sha256>`. */
  readonly key: string
  readonly limit: number
  readonly windowSeconds: number
}

export interface RateLimitDecision {
  readonly allowed: boolean
  readonly remaining: number
  readonly retryAfterSeconds: number
}

/** Fixed-window counter. Consuming increments the counter when allowed. */
export class RateLimiter extends Context.Service<
  RateLimiter,
  {
    consume(request: RateLimitRequest): Effect.Effect<RateLimitDecision, PersistenceError>
  }
>()("@dadalink/ports/RateLimiter") {}
