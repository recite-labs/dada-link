package org.recitelabs.dadalink.feature.disguise

import androidx.compose.runtime.Composable
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.feature.disguise.calculator.CalculatorDestination
import org.recitelabs.dadalink.feature.disguise.notes.NotesDestination
import org.recitelabs.dadalink.feature.disguise.unlock.PinUnlockDestination

/**
 * What a locked app shows. Successful PIN entry flips the shared SessionLock; the host observes it,
 * so this composable needs no callback (and the disguises carry no "open app" affordance at all).
 */
@Composable
fun LockGate(mode: DisguiseMode) {
    when (mode) {
        DisguiseMode.CALCULATOR -> CalculatorDestination()
        DisguiseMode.NOTES -> NotesDestination()
        DisguiseMode.NONE -> PinUnlockDestination()
    }
}
