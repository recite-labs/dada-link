package org.recitelabs.dadalink.core.model

enum class ChatRole { USER, ASSISTANT }

/** A reviewed piece of content the answer is grounded in. */
data class SourceRef(val title: String, val reviewedBy: String?)

data class ChatMessage(
    val id: String,
    val role: ChatRole,
    val text: String,
    val sources: List<SourceRef> = emptyList(),
    val followUps: List<String> = emptyList(),
    val isStreaming: Boolean = false,
    val isError: Boolean = false,
)

/** Streaming events produced by an assistant backend. */
sealed interface AssistantEvent {
    data class TextDelta(val text: String) : AssistantEvent
    data class Sources(val sources: List<SourceRef>) : AssistantEvent
    data class FollowUps(val suggestions: List<String>) : AssistantEvent
    /** The backend detected danger: the UI should surface SOS and local emergency numbers. */
    data object EmergencyDetected : AssistantEvent
}
