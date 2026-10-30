import { Cause, Predicate } from "effect"
import { ApiError } from "./ApiError.ts"

/** Maps one failure from the typed client (contract errors, transport, decoding) to an `ApiError`. */
export const failureToApiError = (failure: unknown): ApiError => {
  if (Predicate.isTagged(failure, "NotFound")) return new ApiError("not-found")
  if (Predicate.isTagged(failure, "RateLimited")) {
    const retryAfterSeconds = Predicate.hasProperty(failure, "retryAfterSeconds")
      ? failure.retryAfterSeconds
      : undefined
    return new ApiError("rate-limited", Predicate.isNumber(retryAfterSeconds) ? { retryAfterSeconds } : {})
  }
  if (Predicate.isTagged(failure, "UpstreamUnavailable")) return new ApiError("unavailable")
  if (Predicate.isTagged(failure, "ValidationFailed") || Predicate.isTagged(failure, "SchemaError")) {
    return new ApiError("invalid-request")
  }
  if (Predicate.isTagged(failure, "HttpClientError")) {
    const status = Predicate.hasProperty(failure, "response") ? statusOf(failure.response) : undefined
    return status !== undefined && status >= 500 ? new ApiError("unavailable") : new ApiError("network")
  }
  if (Predicate.isTagged(failure, "SseError") || Predicate.isTagged(failure, "Retry")) return new ApiError("network")
  return new ApiError("unexpected")
}

const statusOf = (response: unknown): number | undefined =>
  Predicate.hasProperty(response, "status") && Predicate.isNumber(response.status) ? response.status : undefined

/**
 * Turns a failed run into what a Promise consumer expects: an `AbortError`
 * when the caller cancelled (TanStack Query, unmounted chat), otherwise an `ApiError`.
 */
export const causeToError = <E>(cause: Cause.Cause<E>): Error => {
  if (Cause.hasInterruptsOnly(cause)) return new DOMException("The request was cancelled", "AbortError")
  const failure = Cause.findErrorOption(cause)
  return failure._tag === "Some" ? failureToApiError(failure.value) : new ApiError("unexpected")
}
