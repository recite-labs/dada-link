package org.recitelabs.dadalink.core.domain.usecase

import org.recitelabs.dadalink.core.domain.repository.PinRepository
import org.recitelabs.dadalink.core.domain.repository.SessionLock
import javax.inject.Inject

/** Verifies the PIN and unlocks the session on success. */
class UnlockWithPinUseCase @Inject constructor(
    private val pins: PinRepository,
    private val sessionLock: SessionLock,
) {
    suspend operator fun invoke(pin: String): Boolean {
        val ok = pin.length == 4 && pins.verify(pin)
        if (ok) sessionLock.unlock()
        return ok
    }
}
