package org.recitelabs.dadalink.feature.help

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpDirectory
import javax.inject.Inject

sealed interface HelpUiState {
    data object Loading : HelpUiState
    data class Ready(val country: Country, val countries: List<Country>, val directory: HelpDirectory?) : HelpUiState
}

@HiltViewModel
class HelpViewModel @Inject constructor(
    private val settings: SettingsRepository,
    private val content: ContentRepository,
) : ViewModel() {

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<HelpUiState> = settings.settings
        .map { it.country to it.language }
        .distinctUntilChanged()
        .mapLatest { (country, language) ->
            HelpUiState.Ready(country, content.countriesWithDirectory(), content.helpDirectory(country, language))
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HelpUiState.Loading)

    fun selectCountry(country: Country) {
        viewModelScope.launch { settings.setCountry(country) }
    }
}
