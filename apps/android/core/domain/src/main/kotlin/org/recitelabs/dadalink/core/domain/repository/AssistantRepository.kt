package org.recitelabs.dadalink.core.domain.repository

import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.Country

/**
 * "Ask Dada". Streams the answer to the last user message in [conversation].
 * Conversations are kept in memory only and never persisted.
 */
interface AssistantRepository {
    fun ask(conversation: List<ChatMessage>, language: AppLanguage, country: Country): Flow<AssistantEvent>
}
