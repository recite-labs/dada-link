package org.recitelabs.dadalink.core.testing.fake

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.JourneyPhase

class FakeAssistantRepository(
    var events: List<AssistantEvent> = listOf(AssistantEvent.TextDelta("Hello "), AssistantEvent.TextDelta("sister.")),
    var failure: Throwable? = null,
) : AssistantRepository {
    val requests = mutableListOf<List<ChatMessage>>()
    val phases = mutableListOf<JourneyPhase>()
    val feedback = mutableListOf<Pair<Boolean, List<String>>>()

    override fun ask(conversation: List<ChatMessage>, language: AppLanguage, country: Country, phase: JourneyPhase): Flow<AssistantEvent> = flow {
        requests += conversation
        phases += phase
        events.forEach { emit(it) }
        failure?.let { throw it }
    }

    override suspend fun sendFeedback(helpful: Boolean, language: AppLanguage, contentIds: List<String>) {
        feedback += helpful to contentIds
    }
}
