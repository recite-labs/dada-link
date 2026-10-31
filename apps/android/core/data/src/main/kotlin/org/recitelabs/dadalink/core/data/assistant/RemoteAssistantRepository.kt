package org.recitelabs.dadalink.core.data.assistant

import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import org.recitelabs.dadalink.core.data.device.DeviceIdProvider
import org.recitelabs.dadalink.core.data.wireLocale
import org.recitelabs.dadalink.core.domain.repository.AssistantRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantError
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.AssistantException
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.EmergencyContact
import org.recitelabs.dadalink.core.model.EmergencyNotice
import org.recitelabs.dadalink.core.model.JourneyPhase
import org.recitelabs.dadalink.core.model.SourceRef
import org.recitelabs.dadalink.core.network.ApiException
import org.recitelabs.dadalink.core.network.AssistantApi
import org.recitelabs.dadalink.core.network.model.AskRequestDto
import org.recitelabs.dadalink.core.network.model.AssistantFeedbackDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto
import java.io.IOException
import javax.inject.Inject

/**
 * `POST /assistant/ask/stream`. Only the last question leaves the phone (the API is single-turn),
 * with the language, country and journey phase that ground the answer.
 */
class RemoteAssistantRepository @Inject constructor(
    private val api: AssistantApi,
    private val deviceIds: DeviceIdProvider,
) : AssistantRepository {

    override fun ask(conversation: List<ChatMessage>, language: AppLanguage, country: Country, phase: JourneyPhase): Flow<AssistantEvent> = flow {
        val question = conversation.lastOrNull { it.role == ChatRole.USER }?.text?.trim().orEmpty()
        require(question.isNotEmpty()) { "Conversation must end with a user question" }
        val request = AskRequestDto(
            deviceId = deviceIds.deviceId(),
            locale = language.wireLocale,
            country = country.isoCode,
            phase = phase.wireValue,
            question = question.take(MAX_QUESTION),
        )
        emitAll(api.stream(request).map(::toEvent))
    }.catch { throw it.toAssistantException() }

    override suspend fun sendFeedback(helpful: Boolean, language: AppLanguage, contentIds: List<String>) {
        try {
            api.feedback(AssistantFeedbackDto(helpful, language.wireLocale, contentIds.distinct().take(MAX_FEEDBACK_IDS)))
        } catch (e: CancellationException) {
            throw e
        } catch (_: IOException) {
            // Opt-in and best effort: never bother the user about it.
        }
    }

    private fun toEvent(dto: AssistantStreamEventDto): AssistantEvent = when (dto) {
        is AssistantStreamEventDto.Delta -> AssistantEvent.TextDelta(dto.text)
        is AssistantStreamEventDto.Citations -> AssistantEvent.Sources(dto.citations.map { SourceRef(it.title, reviewedBy = null, contentId = it.contentId) })
        is AssistantStreamEventDto.Emergency -> AssistantEvent.Emergency(
            EmergencyNotice(dto.notice.message, dto.notice.contacts.map { EmergencyContact(it.name, it.phone) }),
        )
        is AssistantStreamEventDto.Done -> AssistantEvent.TextDelta("") // never emitted by the API client
    }

    private fun Throwable.toAssistantException(): Throwable = when (this) {
        is AssistantException, is CancellationException, is IllegalArgumentException -> this
        is ApiException.RateLimited -> AssistantException(AssistantError.QUOTA, retryAfterSeconds, this)
        is ApiException -> AssistantException(AssistantError.UNAVAILABLE, cause = this)
        is IOException -> AssistantException(AssistantError.OFFLINE, cause = this)
        else -> this
    }

    private companion object {
        /** `MAX_QUESTION_LENGTH` in packages/domain. */
        const val MAX_QUESTION = 2_000
        const val MAX_FEEDBACK_IDS = 20
    }
}
