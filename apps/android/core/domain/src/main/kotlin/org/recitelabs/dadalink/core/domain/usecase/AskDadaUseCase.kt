package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.safety.EmergencyDetector
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import javax.inject.Inject

/**
 * Asks the assistant about the last user message. If the message looks like an emergency we emit
 * [AssistantEvent.EmergencyDetected] first, before any network round-trip.
 */
class AskDadaUseCase @Inject constructor(
    private val assistant: AssistantRepository,
    private val settings: SettingsRepository,
    private val emergencyDetector: EmergencyDetector,
) {
    operator fun invoke(conversation: List<ChatMessage>): Flow<AssistantEvent> = flow {
        val last = conversation.lastOrNull { it.role == ChatRole.USER }
        require(last != null) { "Conversation must contain a user message" }
        if (emergencyDetector.isEmergency(last.text)) emit(AssistantEvent.EmergencyDetected)
        val current = settings.settings.first()
        emitAll(assistant.ask(conversation, current.language, current.country, current.phase))
    }
}
