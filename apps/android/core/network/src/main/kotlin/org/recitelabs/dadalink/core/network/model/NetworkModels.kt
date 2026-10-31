package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/*
 * Wire models. PROVISIONAL: the backend contract (packages/api → openapi.json) is not published
 * yet. Keep these isolated here; the rest of the app only sees core:model types.
 */

@Serializable
data class AssistantRequestDto(
    val messages: List<AssistantMessageDto>,
    val locale: String,
    val country: String,
)

@Serializable
data class AssistantMessageDto(val role: String, val content: String)

@Serializable
data class DeltaDto(val text: String)

@Serializable
data class SourcesDto(val sources: List<SourceDto>)

@Serializable
data class SourceDto(val title: String, @SerialName("reviewed_by") val reviewedBy: String? = null)

@Serializable
data class FollowUpsDto(val suggestions: List<String>)

/** Parsed assistant stream event. */
sealed interface AssistantStreamEvent {
    data class Delta(val text: String) : AssistantStreamEvent
    data class Sources(val sources: List<SourceDto>) : AssistantStreamEvent
    data class FollowUps(val suggestions: List<String>) : AssistantStreamEvent
    data object Emergency : AssistantStreamEvent
    data object Done : AssistantStreamEvent
}

@Serializable
data class SosRelayRequestDto(
    val message: String,
    @SerialName("contact_phone") val contactPhone: String? = null,
    @SerialName("contact_telegram") val contactTelegram: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
)
