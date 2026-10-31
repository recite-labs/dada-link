package org.recitelabs.dadalink.feature.onboarding.welcome

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import javax.inject.Inject

data class WelcomeUiState(
    val selected: AppLanguage = AppLanguage.Default,
    val languages: List<AppLanguage> = AppLanguage.entries,
)

@HiltViewModel
class WelcomeViewModel @Inject constructor(private val settings: SettingsRepository) : ViewModel() {

    val uiState: StateFlow<WelcomeUiState> = settings.settings
        .map { WelcomeUiState(selected = it.language) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), WelcomeUiState())

    fun selectLanguage(language: AppLanguage) {
        if (!language.isAvailable) return
        viewModelScope.launch { settings.setLanguage(language) }
    }
}
