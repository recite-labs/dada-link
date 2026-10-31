package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.Serializable

/** `SosRequest` — body of `POST /safety/sos`. The server stores nothing. */
@Serializable
data class SosRequestDto(
    val deviceId: String,
    val locale: String,
    val country: String? = null,
    val trustedContact: TrustedContactDto,
    /** Free text, at most 500 characters (the server shortens it further for SMS). */
    val message: String? = null,
    val location: GeoLocationDto? = null,
)

/** `TrustedContact` — at least one of [phone] (strict E.164) or [telegramChatId] is required. */
@Serializable
data class TrustedContactDto(
    val phone: String? = null,
    val telegramChatId: Long? = null,
)

/** `GeoLocation`. */
@Serializable
data class GeoLocationDto(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Double? = null,
)

/** `SosResultEncoded`. Values are `SosChannel` literals (`sms`, `telegram`). */
@Serializable
data class SosResultDto(
    val deliveredVia: List<String>,
    val failedVia: List<String>,
)
