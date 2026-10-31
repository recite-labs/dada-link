package org.recitelabs.dadalink.feature.disguise.calculator

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.usecase.UnlockWithPinUseCase
import javax.inject.Inject

/**
 * Calculator disguise. Typing exactly the 4-digit PIN and pressing "=" unlocks the app; a wrong
 * PIN behaves like any number, so nothing reveals that a secret exists.
 */
@HiltViewModel
class CalculatorViewModel @Inject constructor(private val unlockWithPin: UnlockWithPinUseCase) : ViewModel() {
    private val state = MutableStateFlow(CalculatorState())
    val uiState: StateFlow<CalculatorState> = state.asStateFlow()

    fun press(key: CalcKey) {
        val before = state.value
        val candidate = before.typedDigits.takeIf {
            key == CalcKey.Equals && before.pending == null && it.length == 4 && before.entry == it
        }
        state.value = CalculatorEngine.press(before, key)
        if (candidate != null) viewModelScope.launch { unlockWithPin(candidate) }
    }
}
