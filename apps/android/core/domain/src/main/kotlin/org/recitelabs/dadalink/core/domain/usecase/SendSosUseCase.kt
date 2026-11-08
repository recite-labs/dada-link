package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withTimeoutOrNull
import org.recitelabs.dadalink.core.domain.repository.LocationProvider
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.repository.SosRelay
import org.recitelabs.dadalink.core.domain.safety.SosMessageFormatter
import org.recitelabs.dadalink.core.domain.safety.SosMessageLabels
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosOutcome
import java.time.Clock
import javax.inject.Inject

sealed interface SendSosResult {
    data object NoTrustedContact : SendSosResult
    data class Done(val outcome: SosOutcome) : SendSosResult
}

/**
 * Sends an SOS to the trusted contact:
 *  1. the server relay (Telegram / SMS provider), queued if offline;
 *  2. then the UI opens the user's SMS app with the alert filled in (works without data), or the
 *     share sheet when the contact has no phone number. The app does not hold SEND_SMS.
 */
class SendSosUseCase @Inject constructor(
    private val settings: SettingsRepository,
    private val location: LocationProvider,
    private val relay: SosRelay,
    private val clock: Clock,
) {
    suspend operator fun invoke(baseMessage: String, labels: SosMessageLabels): SendSosResult = coroutineScope {
        val current = settings.settings.first()
        val contact = current.trustedContact ?: return@coroutineScope SendSosResult.NoTrustedContact
        val point = withTimeoutOrNull(LOCATION_TIMEOUT_MS) { location.currentLocation() }
        val now = clock.instant()
        val alert = SosAlert(
            message = SosMessageFormatter.format(baseMessage, point, now, labels),
            location = point,
            createdAt = now,
            contact = contact,
            note = baseMessage,
            language = current.language,
            country = current.country,
        )
        SendSosResult.Done(SosOutcome(alert, listOf(relay.relay(alert))))
    }

    private companion object {
        const val LOCATION_TIMEOUT_MS = 6_000L
    }
}
