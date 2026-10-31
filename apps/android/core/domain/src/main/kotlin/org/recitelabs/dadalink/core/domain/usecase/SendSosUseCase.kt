package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withTimeoutOrNull
import org.recitelabs.dadalink.core.domain.repository.LocationProvider
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.repository.SmsGateway
import org.recitelabs.dadalink.core.domain.repository.SosRelay
import org.recitelabs.dadalink.core.domain.safety.SosMessageFormatter
import org.recitelabs.dadalink.core.domain.safety.SosMessageLabels
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.core.model.SosOutcome
import java.time.Clock
import javax.inject.Inject

sealed interface SendSosResult {
    data object NoTrustedContact : SendSosResult
    data class Done(val outcome: SosOutcome) : SendSosResult
}

/**
 * Sends an SOS to the trusted contact over every available channel, in parallel:
 *  - SMS straight from the phone (works without data), if permitted;
 *  - server relay (Telegram/SMS provider), queued if offline.
 * If direct SMS is not possible the outcome asks the UI to open the share sheet.
 */
class SendSosUseCase @Inject constructor(
    private val settings: SettingsRepository,
    private val location: LocationProvider,
    private val sms: SmsGateway,
    private val relay: SosRelay,
    private val clock: Clock,
) {
    suspend operator fun invoke(baseMessage: String, labels: SosMessageLabels): SendSosResult = coroutineScope {
        val contact = settings.settings.first().trustedContact ?: return@coroutineScope SendSosResult.NoTrustedContact
        val point = withTimeoutOrNull(LOCATION_TIMEOUT_MS) { location.currentLocation() }
        val now = clock.instant()
        val alert = SosAlert(
            message = SosMessageFormatter.format(baseMessage, point, now, labels),
            location = point,
            createdAt = now,
            contact = contact,
        )
        val smsResult = async {
            val phone = contact.phone
            when {
                phone == null -> SosChannelResult.Failed(SosChannel.SMS, "no phone number")
                !sms.canSendDirectly() -> SosChannelResult.Failed(SosChannel.SMS, "permission not granted")
                else -> sms.send(phone, alert.message)
            }
        }
        val relayResult = async { relay.relay(alert) }
        SendSosResult.Done(SosOutcome(alert, listOf(smsResult.await(), relayResult.await())))
    }

    private companion object {
        const val LOCATION_TIMEOUT_MS = 6_000L
    }
}
