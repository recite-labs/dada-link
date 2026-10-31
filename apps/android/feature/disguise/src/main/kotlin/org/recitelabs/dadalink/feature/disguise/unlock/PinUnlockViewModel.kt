package org.recitelabs.dadalink.feature.disguise.unlock

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.safety.PinPolicy
import org.recitelabs.dadalink.core.domain.usecase.UnlockWithPinUseCase
import javax.inject.Inject

data class PinUnlockUiState(
    val entered: String = "",
    val isWrong: Boolean = false,
    val failedAttempts: Int = 0,
    val lockoutSeconds: Int = 0,
    val isChecking: Boolean = false,
)

/** PIN lock (no disguise). After 5 wrong tries the keypad pauses for 30 s, growing each time. */
@HiltViewModel
class PinUnlockViewModel @Inject constructor(private val unlockWithPin: UnlockWithPinUseCase) : ViewModel() {
    private val state = MutableStateFlow(PinUnlockUiState())
    val uiState: StateFlow<PinUnlockUiState> = state.asStateFlow()

    fun onDigit(digit: Char) {
        val s = state.value
        if (s.lockoutSeconds > 0 || s.isChecking || s.entered.length >= PinPolicy.LENGTH) return
        val entered = s.entered + digit
        state.update { it.copy(entered = entered, isWrong = false) }
        if (entered.length == PinPolicy.LENGTH) verify(entered)
    }

    fun onDelete() = state.update { it.copy(entered = it.entered.dropLast(1), isWrong = false) }

    private fun verify(pin: String) {
        state.update { it.copy(isChecking = true) }
        viewModelScope.launch {
            if (unlockWithPin(pin)) {
                state.update { it.copy(isChecking = false, entered = "") }
                return@launch
            }
            val failed = state.value.failedAttempts + 1
            state.update { it.copy(isChecking = false, entered = "", isWrong = true, failedAttempts = failed) }
            if (failed % MAX_TRIES == 0) countdown(LOCKOUT_SECONDS * (failed / MAX_TRIES))
        }
    }

    private suspend fun countdown(seconds: Int) {
        for (remaining in seconds downTo 1) {
            state.update { it.copy(lockoutSeconds = remaining) }
            delay(1_000)
        }
        state.update { it.copy(lockoutSeconds = 0) }
    }

    private companion object {
        const val MAX_TRIES = 5
        const val LOCKOUT_SECONDS = 30
    }
}
