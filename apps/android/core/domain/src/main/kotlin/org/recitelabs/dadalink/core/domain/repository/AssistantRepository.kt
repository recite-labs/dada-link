package org.recitelabs.dadalink.core.domain.repository

import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.JourneyPhase

/**
 * "Ask Dada". Streams the answer to the last user message in [conversation].
 * Conversations are kept in memory only and never persisted.
 *
 * The flow fails with [org.recitelabs.dadalink.core.model.AssistantException] when no answer can
 * be produced (offline, quota used up, service unavailable).
 */
interface AssistantRepository {
    fun ask(conversation: List<ChatMessage>, language: AppLanguage, country: Country, phase: JourneyPhase): Flow<AssistantEvent>

    /** Opt-in, content-free feedback: only helpful yes/no and the cited content ids. Best effort. */
    suspend fun sendFeedback(helpful: Boolean, language: AppLanguage, contentIds: List<String>)
}
