package org.recitelabs.dadalink.feature.assistant

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.usecase.AskDadaUseCase
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.feature.assistant.navigation.AskRoute
import java.util.UUID
import javax.inject.Inject

data class AskUiState(
    val messages: List<ChatMessage> = emptyList(),
    val input: String = "",
    val isAnswering: Boolean = false,
    val showEmergency: Boolean = false,
    val startVoice: Boolean = false,
) {
    val canSend: Boolean get() = input.isNotBlank() && !isAnswering
}

sealed interface AskAction {
    data class InputChanged(val text: String) : AskAction
    data object Send : AskAction
    data class Ask(val text: String) : AskAction
    data object Retry : AskAction
    data object VoiceConsumed : AskAction
}

/** Conversation lives only in this ViewModel: nothing is written to disk. */
@HiltViewModel
class AskViewModel @Inject constructor(
    private val askDada: AskDadaUseCase,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val route = runCatching { savedStateHandle.toRoute<AskRoute>() }.getOrDefault(AskRoute())
    private val state = MutableStateFlow(AskUiState(startVoice = route.voice))
    val uiState: StateFlow<AskUiState> = state.asStateFlow()
    private var answering: Job? = null

    init {
        route.question?.takeIf { it.isNotBlank() }?.let(::ask)
    }

    fun onAction(action: AskAction) {
        when (action) {
            is AskAction.InputChanged -> state.update { it.copy(input = action.text.take(MAX_INPUT)) }
            AskAction.Send -> state.value.input.takeIf { state.value.canSend }?.let { text ->
                state.update { it.copy(input = "") }
                ask(text)
            }
            is AskAction.Ask -> if (!state.value.isAnswering) ask(action.text)
            AskAction.Retry -> retry()
            AskAction.VoiceConsumed -> state.update { it.copy(startVoice = false) }
        }
    }

    private fun ask(text: String) {
        val user = ChatMessage(newId(), ChatRole.USER, text.trim())
        state.update { it.copy(messages = it.messages + user) }
        stream()
    }

    private fun retry() {
        if (state.value.isAnswering) return
        state.update { s -> s.copy(messages = s.messages.filterNot { it.isError }) }
        stream()
    }

    private fun stream() {
        val conversation = state.value.messages
        val answerId = newId()
        state.update {
            it.copy(isAnswering = true, messages = it.messages + ChatMessage(answerId, ChatRole.ASSISTANT, "", isStreaming = true))
        }
        answering?.cancel()
        answering = viewModelScope.launch {
            try {
                askDada(conversation).collect { event -> apply(answerId, event) }
                updateAnswer(answerId) { it.copy(isStreaming = false) }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                updateAnswer(answerId) { it.copy(isStreaming = false, isError = true, text = "") }
            } finally {
                state.update { it.copy(isAnswering = false) }
            }
        }
    }

    private fun apply(id: String, event: AssistantEvent) = when (event) {
        is AssistantEvent.TextDelta -> updateAnswer(id) { it.copy(text = it.text + event.text) }
        is AssistantEvent.Sources -> updateAnswer(id) { it.copy(sources = event.sources) }
        is AssistantEvent.FollowUps -> updateAnswer(id) { it.copy(followUps = event.suggestions) }
        AssistantEvent.EmergencyDetected -> state.update { it.copy(showEmergency = true) }
    }

    private fun updateAnswer(id: String, transform: (ChatMessage) -> ChatMessage) = state.update { s ->
        s.copy(messages = s.messages.map { if (it.id == id) transform(it) else it })
    }

    private fun newId() = UUID.randomUUID().toString()

    private companion object {
        const val MAX_INPUT = 1_000
    }
}
