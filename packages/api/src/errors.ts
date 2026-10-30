import { NotFound, RateLimited, UpstreamUnavailable, ValidationFailed } from "@dadalink/domain"
import { HttpApiSchema } from "effect/http-api"

/** Domain errors mapped to HTTP status codes at the contract boundary. */
export const NotFoundError = NotFound.pipe(HttpApiSchema.status(404))
export const ValidationError = ValidationFailed.pipe(HttpApiSchema.status(400))
export const RateLimitedError = RateLimited.pipe(HttpApiSchema.status(429))
export const UpstreamError = UpstreamUnavailable.pipe(HttpApiSchema.status(503))
