package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.flow.first
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.ChatMessage
import javax.inject.Inject

/** Opt-in "was this helpful?": sends yes/no and the cited content ids only — never the question or answer. */
class SendAssistantFeedbackUseCase @Inject constructor(
    private val assistant: AssistantRepository,
    private val settings: SettingsRepository,
) {
    suspend operator fun invoke(answer: ChatMessage, helpful: Boolean) {
        val ids = answer.sources.mapNotNull { it.contentId }
        if (ids.isEmpty()) return
        assistant.sendFeedback(helpful, settings.settings.first().language, ids)
    }
}
