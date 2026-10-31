package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** `AskRequest` — body of `POST /assistant/ask` and `/assistant/ask/stream`. */
@Serializable
data class AskRequestDto(
    /** Random per-install UUID, used by the server only for the daily quota. */
    val deviceId: String,
    val locale: String,
    val country: String? = null,
    val phase: String? = null,
    val question: String,
)

/** `AskResponseEncoded` — non-streaming answer. [answer] already starts with the emergency message. */
@Serializable
data class AskResponseDto(
    val locale: String,
    val answer: String,
    val citations: List<CitationDto>,
    val emergency: EmergencyNoticeDto?,
    val grounded: Boolean,
)

/** `CitationEncoded`. */
@Serializable
data class CitationDto(
    val contentId: String,
    val title: String,
    val locale: String,
)

/** `EmergencyNoticeEncoded`. [categories] are `EmergencyCategory` literals. */
@Serializable
data class EmergencyNoticeDto(
    val categories: List<String>,
    val message: String,
    val contacts: List<EmergencyContactDto>,
)

/** `AssistantFeedback` — body of `POST /assistant/feedback` (204). */
@Serializable
data class AssistantFeedbackDto(
    val helpful: Boolean,
    val locale: String,
    val contentIds: List<String>,
)

/**
 * `AssistantStreamEvent` — the JSON in each SSE `data:` line of `/assistant/ask/stream`,
 * discriminated by `_tag`. Order: `Emergency`? → `Citations` → `Delta`* → `Done`.
 */
sealed interface AssistantStreamEventDto {
    @Serializable
    data class Emergency(val notice: EmergencyNoticeDto, @SerialName("_tag") val tag: String = TAG) : AssistantStreamEventDto {
        companion object {
            const val TAG = "Emergency"
        }
    }

    @Serializable
    data class Citations(
        val citations: List<CitationDto>,
        val grounded: Boolean,
        @SerialName("_tag") val tag: String = TAG,
    ) : AssistantStreamEventDto {
        companion object {
            const val TAG = "Citations"
        }
    }

    @Serializable
    data class Delta(val text: String, @SerialName("_tag") val tag: String = TAG) : AssistantStreamEventDto {
        companion object {
            const val TAG = "Delta"
        }
    }

    @Serializable
    data class Done(@SerialName("_tag") val tag: String = TAG) : AssistantStreamEventDto {
        companion object {
            const val TAG = "Done"
        }
    }
}
