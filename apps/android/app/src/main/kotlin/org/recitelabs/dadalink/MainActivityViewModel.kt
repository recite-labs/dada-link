package org.recitelabs.dadalink

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import org.recitelabs.dadalink.core.domain.repository.SessionLock
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.UserSettings
import javax.inject.Inject

sealed interface MainUiState {
    data object Loading : MainUiState
    data class Ready(val settings: UserSettings, val isUnlocked: Boolean) : MainUiState
}

@HiltViewModel
class MainActivityViewModel @Inject constructor(
    settings: SettingsRepository,
    private val sessionLock: SessionLock,
) : ViewModel() {

    val uiState: StateFlow<MainUiState> = combine(settings.settings, sessionLock.isUnlocked) { s, unlocked ->
        MainUiState.Ready(s, unlocked)
    }.stateIn(viewModelScope, SharingStarted.Eagerly, MainUiState.Loading)

    fun lock() = sessionLock.lock()
}
