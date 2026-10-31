package org.recitelabs.dadalink.feature.onboarding.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator
import org.recitelabs.dadalink.core.domain.usecase.UpdateDisguiseUseCase
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import javax.inject.Inject

data class SafetySettingsUiState(
    val language: AppLanguage = AppLanguage.Default,
    val disguise: DisguiseMode = DisguiseMode.NONE,
    val hideNotificationContent: Boolean = true,
    val contactName: String = "",
    val contactRelation: String = "",
    val contactPhone: String = "",
    val contactTelegram: String = "",
    val contactProblems: Set<TrustedContactValidator.Problem> = emptySet(),
    val contactSaved: Boolean = false,
)

@HiltViewModel
class SafetySettingsViewModel @Inject constructor(
    private val settings: SettingsRepository,
    private val updateDisguise: UpdateDisguiseUseCase,
) : ViewModel() {
    private val state = MutableStateFlow(SafetySettingsUiState())
    val uiState: StateFlow<SafetySettingsUiState> = state.asStateFlow()

    init {
        viewModelScope.launch {
            val s = settings.settings.first()
            val c = s.trustedContact
            state.value = SafetySettingsUiState(
                language = s.language,
                disguise = s.disguise,
                hideNotificationContent = s.hideNotificationContent,
                contactName = c?.name.orEmpty(),
                contactRelation = c?.relation.orEmpty(),
                contactPhone = c?.phone.orEmpty(),
                contactTelegram = c?.telegram.orEmpty(),
            )
        }
    }

    fun setLanguage(language: AppLanguage) {
        state.update { it.copy(language = language) }
        viewModelScope.launch { settings.setLanguage(language) }
    }

    fun setDisguise(mode: DisguiseMode) {
        state.update { it.copy(disguise = mode) }
        viewModelScope.launch { updateDisguise(mode) }
    }

    fun setHideNotifications(hide: Boolean) {
        state.update { it.copy(hideNotificationContent = hide) }
        viewModelScope.launch { settings.setHideNotificationContent(hide) }
    }

    fun editContact(transform: (SafetySettingsUiState) -> SafetySettingsUiState) =
        state.update { transform(it).copy(contactProblems = emptySet(), contactSaved = false) }

    fun saveContact() {
        val s = state.value
        val contact = TrustedContact(
            name = s.contactName.trim(),
            relation = s.contactRelation.trim(),
            phone = s.contactPhone.takeIf { it.isNotBlank() }?.let(TrustedContactValidator::normalizePhone),
            telegram = s.contactTelegram.takeIf { it.isNotBlank() }?.let(TrustedContactValidator::normalizeTelegram),
        )
        val problems = TrustedContactValidator.problems(contact)
        if (problems.isNotEmpty()) {
            state.update { it.copy(contactProblems = problems) }
            return
        }
        viewModelScope.launch {
            settings.setTrustedContact(contact)
            state.update { it.copy(contactSaved = true) }
        }
    }
}
