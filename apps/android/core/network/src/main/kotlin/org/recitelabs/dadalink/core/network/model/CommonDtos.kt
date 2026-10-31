package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** `HealthStatusEncoded` — `GET /health`. */
@Serializable
data class HealthStatusDto(
    val status: String,
    val service: String,
    val version: String,
)

/** `RateLimitedEncoded` — 429 body. */
@Serializable
data class RateLimitedDto(
    val scope: String,
    val retryAfterSeconds: Long,
    @SerialName("_tag") val tag: String = "RateLimited",
)

/** `UpstreamUnavailableEncoded` — 503 body and the stream failure event. */
@Serializable
data class UpstreamUnavailableDto(
    val service: String,
    @SerialName("_tag") val tag: String = "UpstreamUnavailable",
)

/** `NotFoundEncoded` — 404 body. */
@Serializable
data class NotFoundDto(
    val entity: String,
    val id: String,
    @SerialName("_tag") val tag: String = "NotFound",
)

/** `ValidationFailedEncoded` — 400 body. */
@Serializable
data class ValidationFailedDto(
    val reason: String,
    @SerialName("_tag") val tag: String = "ValidationFailed",
)
