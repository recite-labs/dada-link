package org.recitelabs.dadalink.core.domain.repository

import org.recitelabs.dadalink.core.model.GeoPoint
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannelResult

/** Best-effort current location; null when unavailable or not permitted. */
interface LocationProvider {
    suspend fun currentLocation(): GeoPoint?
}

/** Relays the alert through the DadaLink server (Telegram / SMS provider); queued when offline. */
interface SosRelay {
    suspend fun relay(alert: SosAlert): SosChannelResult
}
