package org.recitelabs.dadalink.core.domain.usecase

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
 * Sends an SOS to the trusted contact:
 *  1. SMS straight from the phone first (works without data), if permitted;
 *  2. then the server relay (Telegram/SMS provider) as a secondary channel, queued if offline.
 * The relay never delays or replaces the direct SMS. If direct SMS is not possible the outcome asks
 * the UI to open the share sheet.
 */
class SendSosUseCase @Inject constructor(
    private val settings: SettingsRepository,
    private val location: LocationProvider,
    private val sms: SmsGateway,
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
        val phone = contact.phone
        val smsResult = when {
            phone == null -> SosChannelResult.Failed(SosChannel.SMS, "no phone number")
            !sms.canSendDirectly() -> SosChannelResult.Failed(SosChannel.SMS, "permission not granted")
            else -> sms.send(phone, alert.message)
        }
        val relayResult = relay.relay(alert)
        SendSosResult.Done(SosOutcome(alert, listOf(smsResult, relayResult)))
    }

    private companion object {
        const val LOCATION_TIMEOUT_MS = 6_000L
    }
}
