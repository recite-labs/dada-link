package org.recitelabs.dadalink.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.usecase.CheckInUseCase
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.Mood
import org.recitelabs.dadalink.core.model.TrustedContact
import java.time.Instant
import javax.inject.Inject

data class HomeUiState(
    val nickname: String? = null,
    val country: Country = Country.SAUDI_ARABIA,
    val language: AppLanguage = AppLanguage.Default,
    val contact: TrustedContact? = null,
    val lastCheckIn: Instant? = null,
    /** Kept in memory only: moods are never stored. */
    val mood: Mood? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val settings: SettingsRepository,
    private val checkIn: CheckInUseCase,
) : ViewModel() {
    private val mood = MutableStateFlow<Mood?>(null)

    val uiState: StateFlow<HomeUiState> = combine(settings.settings, mood) { s, m ->
        HomeUiState(s.nickname, s.country, s.language, s.trustedContact, s.lastCheckIn, m)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    fun selectMood(value: Mood) {
        mood.value = value
    }

    fun setLanguage(language: AppLanguage) {
        viewModelScope.launch { settings.setLanguage(language) }
    }

    /** Called after the check-in message was handed to the SMS / share app. */
    fun onCheckedIn() {
        viewModelScope.launch { checkIn() }
    }
}
