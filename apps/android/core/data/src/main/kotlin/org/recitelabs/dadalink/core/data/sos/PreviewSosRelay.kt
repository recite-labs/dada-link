package org.recitelabs.dadalink.core.data.sos

import org.recitelabs.dadalink.core.domain.repository.SosRelay
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import javax.inject.Inject

/**
 * Used while the backend relay does not exist. It deliberately reports *failure*: a safety app must
 * never claim an alert was delivered when it was not. Direct SMS / share remain the real channels.
 */
class PreviewSosRelay @Inject constructor() : SosRelay {
    override suspend fun relay(alert: SosAlert): SosChannelResult =
        SosChannelResult.Failed(SosChannel.RELAY, "server relay not available in this build")
}
