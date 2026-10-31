package org.recitelabs.dadalink.core.domain.usecase

import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import java.time.Clock
import javax.inject.Inject

/** Records that the user told her trusted contact she is OK (message is sent by the UI). */
class CheckInUseCase @Inject constructor(private val settings: SettingsRepository, private val clock: Clock) {
    suspend operator fun invoke() = settings.setLastCheckIn(clock.instant())
}
