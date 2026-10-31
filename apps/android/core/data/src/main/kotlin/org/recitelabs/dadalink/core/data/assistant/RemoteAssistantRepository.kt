package org.recitelabs.dadalink.core.data.assistant

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.SourceRef
import org.recitelabs.dadalink.core.network.AssistantApi
import org.recitelabs.dadalink.core.network.model.AssistantMessageDto
import org.recitelabs.dadalink.core.network.model.AssistantRequestDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEvent
import javax.inject.Inject

class RemoteAssistantRepository @Inject constructor(private val api: AssistantApi) : AssistantRepository {

    override fun ask(conversation: List<ChatMessage>, language: AppLanguage, country: Country): Flow<AssistantEvent> {
        val request = AssistantRequestDto(
            // Only the last turns: keeps requests small and limits what leaves the phone.
            messages = conversation.filterNot { it.isError }.takeLast(MAX_TURNS).map {
                AssistantMessageDto(if (it.role == ChatRole.USER) "user" else "assistant", it.text)
            },
            locale = language.tag,
            country = country.isoCode,
        )
        return api.stream(request).map { event ->
            when (event) {
                is AssistantStreamEvent.Delta -> AssistantEvent.TextDelta(event.text)
                is AssistantStreamEvent.Sources -> AssistantEvent.Sources(event.sources.map { SourceRef(it.title, it.reviewedBy) })
                is AssistantStreamEvent.FollowUps -> AssistantEvent.FollowUps(event.suggestions)
                AssistantStreamEvent.Emergency -> AssistantEvent.EmergencyDetected
                AssistantStreamEvent.Done -> AssistantEvent.TextDelta("")
            }
        }
    }

    private companion object {
        const val MAX_TURNS = 12
    }
}
