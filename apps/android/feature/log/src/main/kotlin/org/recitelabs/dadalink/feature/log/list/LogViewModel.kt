package org.recitelabs.dadalink.feature.log.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.PrivateLogRepository
import org.recitelabs.dadalink.core.domain.usecase.ObserveWagesSummaryUseCase
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.core.model.WagesSummary
import javax.inject.Inject

sealed interface LogUiState {
    data object Loading : LogUiState
    data class Ready(val entries: List<LogEntry>, val wages: WagesSummary) : LogUiState
}

@HiltViewModel
class LogViewModel @Inject constructor(private val log: PrivateLogRepository) : ViewModel() {

    val uiState: StateFlow<LogUiState> = log.entries
        .map { LogUiState.Ready(it, ObserveWagesSummaryUseCase.summarize(it)) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), LogUiState.Loading)

    fun delete(id: Long) {
        viewModelScope.launch { log.delete(id) }
    }
}
