package org.recitelabs.dadalink.feature.sos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.safety.SosMessageLabels
import org.recitelabs.dadalink.core.domain.usecase.SendSosResult
import org.recitelabs.dadalink.core.domain.usecase.SendSosUseCase
import org.recitelabs.dadalink.core.model.SosOutcome
import org.recitelabs.dadalink.core.model.TrustedContact
import javax.inject.Inject

sealed interface SosPhase {
    data object Ready : SosPhase
    data object Sending : SosPhase
    data class Done(val outcome: SosOutcome) : SosPhase
    data object NoContact : SosPhase
}

data class SosUiState(
    val nickname: String? = null,
    val contact: TrustedContact? = null,
    val emergencyNumber: String = "911",
    val embassyNumber: String? = null,
    val phase: SosPhase = SosPhase.Ready,
)

@HiltViewModel
class SosViewModel @Inject constructor(
    private val settings: SettingsRepository,
    private val content: ContentRepository,
    private val sendSos: SendSosUseCase,
) : ViewModel() {

    private val state = MutableStateFlow(SosUiState())
    val uiState: StateFlow<SosUiState> = state.asStateFlow()

    init {
        viewModelScope.launch {
            settings.settings.collectLatest { s ->
                val directory = content.helpDirectory(s.country, s.language)
                state.update {
                    it.copy(
                        nickname = s.nickname,
                        contact = s.trustedContact,
                        emergencyNumber = directory?.emergency?.phone ?: it.emergencyNumber,
                        embassyNumber = directory?.embassy?.phone,
                    )
                }
            }
        }
    }

    /** Message text and labels come from string resources so the alert is in the user's language. */
    fun send(message: String, labels: SosMessageLabels) {
        if (state.value.phase == SosPhase.Sending) return
        state.update { it.copy(phase = SosPhase.Sending) }
        viewModelScope.launch {
            val phase = when (val result = sendSos(message, labels)) {
                SendSosResult.NoTrustedContact -> SosPhase.NoContact
                is SendSosResult.Done -> SosPhase.Done(result.outcome)
            }
            state.update { it.copy(phase = phase) }
        }
    }

    /** After navigating to the "sent" screen, return to Ready so "Send again" works. */
    fun consumeResult() = state.update { it.copy(phase = SosPhase.Ready) }
}
