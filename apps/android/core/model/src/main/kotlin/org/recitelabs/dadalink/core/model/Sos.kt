package org.recitelabs.dadalink.core.model

import java.time.Instant

enum class SosChannel { SMS, SHARE_SHEET, RELAY }

sealed interface SosChannelResult {
    val channel: SosChannel

    data class Sent(override val channel: SosChannel) : SosChannelResult
    /** Will be retried automatically (e.g. relay queued until the phone is online). */
    data class Queued(override val channel: SosChannel) : SosChannelResult
    data class Failed(override val channel: SosChannel, val reason: String) : SosChannelResult
}

data class SosAlert(
    val message: String,
    val location: GeoPoint?,
    val createdAt: Instant,
    val contact: TrustedContact,
)

data class SosOutcome(val alert: SosAlert, val results: List<SosChannelResult>) {
    val delivered: Boolean get() = results.any { it is SosChannelResult.Sent || it is SosChannelResult.Queued }
    /** SMS could not be sent directly; the UI must open the share sheet as a fallback. */
    val needsShareFallback: Boolean
        get() = results.none { it.channel == SosChannel.SMS && it is SosChannelResult.Sent }
}
