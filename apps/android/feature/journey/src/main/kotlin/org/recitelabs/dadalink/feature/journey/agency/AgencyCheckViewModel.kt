package org.recitelabs.dadalink.feature.journey.agency

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.usecase.CheckAgencyUseCase
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import javax.inject.Inject

data class AgencyCheckUiState(
    val query: String = "",
    val isChecking: Boolean = false,
    val result: AgencyCheckResult? = null,
)

@HiltViewModel
class AgencyCheckViewModel @Inject constructor(private val checkAgency: CheckAgencyUseCase) : ViewModel() {
    private val state = MutableStateFlow(AgencyCheckUiState())
    val uiState: StateFlow<AgencyCheckUiState> = state.asStateFlow()

    fun onQueryChange(query: String) = state.update { it.copy(query = query.take(120), result = null) }

    fun check() {
        val query = state.value.query
        if (query.isBlank()) return
        state.update { it.copy(isChecking = true) }
        viewModelScope.launch {
            val result = checkAgency(query)
            state.update { it.copy(isChecking = false, result = result) }
        }
    }
}
