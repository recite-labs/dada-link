package org.recitelabs.dadalink.feature.onboarding.setup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.SessionLock
import org.recitelabs.dadalink.core.domain.safety.PinPolicy
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator
import org.recitelabs.dadalink.core.domain.usecase.CompleteSafeSetupUseCase
import org.recitelabs.dadalink.core.domain.usecase.SafeSetup
import org.recitelabs.dadalink.core.domain.usecase.SafeSetupResult
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import javax.inject.Inject

data class SafeSetupUiState(
    val nickname: String = "",
    val pin: String = "",
    val disguise: DisguiseMode = DisguiseMode.CALCULATOR,
    val contactName: String = "",
    val contactRelation: String = "",
    val contactPhone: String = "",
    val contactTelegram: String = "",
    val hideNotificationContent: Boolean = true,
    val pinError: PinPolicy.Verdict? = null,
    val contactProblems: Set<TrustedContactValidator.Problem> = emptySet(),
    val isSaving: Boolean = false,
    val isComplete: Boolean = false,
) {
    /** The contact block is optional: it only counts once the user starts filling it in. */
    val hasContactInput: Boolean
        get() = listOf(contactName, contactPhone, contactTelegram).any { it.isNotBlank() }
}

sealed interface SafeSetupAction {
    data class NicknameChanged(val value: String) : SafeSetupAction
    data class PinChanged(val value: String) : SafeSetupAction
    data class DisguiseChanged(val value: DisguiseMode) : SafeSetupAction
    data class ContactNameChanged(val value: String) : SafeSetupAction
    data class ContactRelationChanged(val value: String) : SafeSetupAction
    data class ContactPhoneChanged(val value: String) : SafeSetupAction
    data class ContactTelegramChanged(val value: String) : SafeSetupAction
    data class HideNotificationsChanged(val value: Boolean) : SafeSetupAction
    data object Submit : SafeSetupAction
}

@HiltViewModel
class SafeSetupViewModel @Inject constructor(
    private val completeSafeSetup: CompleteSafeSetupUseCase,
    private val sessionLock: SessionLock,
) : ViewModel() {

    private val state = MutableStateFlow(SafeSetupUiState())
    val uiState: StateFlow<SafeSetupUiState> = state.asStateFlow()

    fun onAction(action: SafeSetupAction) {
        when (action) {
            is SafeSetupAction.NicknameChanged -> state.update { it.copy(nickname = action.value.take(40)) }
            is SafeSetupAction.PinChanged -> state.update { it.copy(pin = action.value, pinError = null) }
            is SafeSetupAction.DisguiseChanged -> state.update { it.copy(disguise = action.value) }
            is SafeSetupAction.ContactNameChanged -> state.update { it.copy(contactName = action.value, contactProblems = emptySet()) }
            is SafeSetupAction.ContactRelationChanged -> state.update { it.copy(contactRelation = action.value) }
            is SafeSetupAction.ContactPhoneChanged -> state.update { it.copy(contactPhone = action.value, contactProblems = emptySet()) }
            is SafeSetupAction.ContactTelegramChanged -> state.update { it.copy(contactTelegram = action.value, contactProblems = emptySet()) }
            is SafeSetupAction.HideNotificationsChanged -> state.update { it.copy(hideNotificationContent = action.value) }
            SafeSetupAction.Submit -> submit()
        }
    }

    private fun submit() {
        val current = state.value
        if (current.isSaving) return
        state.update { it.copy(isSaving = true) }
        viewModelScope.launch {
            val contact = if (current.hasContactInput) {
                TrustedContact(current.contactName, current.contactRelation, current.contactPhone, current.contactTelegram)
            } else {
                null
            }
            val result = completeSafeSetup(
                SafeSetup(current.nickname, current.pin, current.disguise, contact, current.hideNotificationContent),
            )
            when (result) {
                SafeSetupResult.Saved -> {
                    sessionLock.unlock()
                    state.update { it.copy(isSaving = false, isComplete = true, pin = "") }
                }
                is SafeSetupResult.Invalid -> state.update {
                    it.copy(
                        isSaving = false,
                        pinError = result.pin.takeIf { verdict -> verdict != PinPolicy.Verdict.VALID },
                        contactProblems = result.contactProblems,
                    )
                }
            }
        }
    }
}
