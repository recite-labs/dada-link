package org.recitelabs.dadalink.core.model

enum class ChatRole { USER, ASSISTANT }

/** A reviewed piece of content the answer is grounded in. [contentId] links to the article. */
data class SourceRef(val title: String, val reviewedBy: String?, val contentId: String? = null)

/** A number to call, put first in an answer when danger is detected. */
data class EmergencyContact(val name: String, val phone: String)

/** Localised "press SOS and call…" notice the backend puts at the top of a dangerous answer. */
data class EmergencyNotice(val message: String, val contacts: List<EmergencyContact>)

/** Why an answer could not be produced. Each maps to a calm, specific message. */
enum class AssistantError {
    /** No connection (or the server could not be reached). */
    OFFLINE,

    /** The daily question quota for this phone is used up. */
    QUOTA,

    /** The server or the model is temporarily unavailable. */
    UNAVAILABLE,
}

/** Thrown by assistant repositories; carries the user-facing [error] category. */
class AssistantException(
    val error: AssistantError,
    val retryAfterSeconds: Long? = null,
    cause: Throwable? = null,
) : Exception(error.name, cause)

data class ChatMessage(
    val id: String,
    val role: ChatRole,
    val text: String,
    val sources: List<SourceRef> = emptyList(),
    val followUps: List<String> = emptyList(),
    val isStreaming: Boolean = false,
    val error: AssistantError? = null,
    /** Shown above the answer text, before anything else. */
    val emergency: EmergencyNotice? = null,
    /** The user's opt-in rating of this answer, once given. */
    val feedback: Boolean? = null,
) {
    val isError: Boolean get() = error != null
}

/** Streaming events produced by an assistant backend. */
sealed interface AssistantEvent {
    data class TextDelta(val text: String) : AssistantEvent
    data class Sources(val sources: List<SourceRef>) : AssistantEvent
    data class FollowUps(val suggestions: List<String>) : AssistantEvent

    /** The device itself detected danger: the UI should surface SOS and local emergency numbers. */
    data object EmergencyDetected : AssistantEvent

    /** The backend detected danger and sent the notice + local numbers to show first. */
    data class Emergency(val notice: EmergencyNotice) : AssistantEvent
}
