import { Schema } from "effect"

/** A requested entity does not exist. */
export class NotFound extends Schema.TaggedError<NotFound>()("NotFound", {
  entity: Schema.String,
  id: Schema.String
}) {
  override get message(): string {
    return `${this.entity} not found: ${this.id}`
  }
}

/** Input was well-formed but violates a business rule. */
export class ValidationFailed extends Schema.TaggedError<ValidationFailed>()("ValidationFailed", {
  reason: Schema.String
}) {
  override get message(): string {
    return this.reason
  }
}

/** A quota was exhausted for a pseudonymous key. */
export class RateLimited extends Schema.TaggedError<RateLimited>()("RateLimited", {
  scope: Schema.String,
  retryAfterSeconds: Schema.Int
}) {
  override get message(): string {
    return `Rate limit exceeded for ${this.scope}; retry after ${this.retryAfterSeconds}s`
  }
}

/** An external dependency (model provider, SMS gateway, Telegram) failed. */
export class UpstreamUnavailable extends Schema.TaggedError<UpstreamUnavailable>()("UpstreamUnavailable", {
  service: Schema.String
}) {
  override get message(): string {
    return `Upstream service unavailable: ${this.service}`
  }
}
