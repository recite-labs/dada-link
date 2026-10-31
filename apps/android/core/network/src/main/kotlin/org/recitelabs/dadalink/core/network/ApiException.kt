package org.recitelabs.dadalink.core.network

import java.io.IOException

/**
 * The server answered, but not with what we asked for. Extends [IOException] so callers that only
 * care about "it did not work" can catch one type; use [isOffline] to tell "no connection" apart.
 */
sealed class ApiException(message: String, cause: Throwable? = null) : IOException(message, cause) {
    /** 429 `RateLimited`: the per-device quota is used up. */
    class RateLimited(val scope: String, val retryAfterSeconds: Long) : ApiException("Rate limited ($scope), retry after ${retryAfterSeconds}s")

    /** 503 `UpstreamUnavailable`, or the stream's failure event. */
    class Upstream(val service: String?) : ApiException("Upstream unavailable: ${service ?: "unknown"}")

    /** 404 `NotFound`. */
    class NotFound(val entity: String?, val id: String?) : ApiException("Not found: $entity/$id")

    /** 400 `ValidationFailed`. [reason] is written for end users by the backend. */
    class Invalid(val reason: String) : ApiException("Validation failed: $reason")

    /** Any other non-2xx status. */
    class Http(val status: Int) : ApiException("HTTP $status")

    /** 2xx with a body that does not match the contract. */
    class Malformed(cause: Throwable) : ApiException("Malformed response: ${cause.message}", cause)
}

/** True for connectivity failures (DNS, connect, TLS, timeouts), false when the server answered. */
val Throwable.isOffline: Boolean get() = this is IOException && this !is ApiException
