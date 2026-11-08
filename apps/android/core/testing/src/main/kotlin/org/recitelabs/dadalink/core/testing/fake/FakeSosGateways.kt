package org.recitelabs.dadalink.core.testing.fake

import org.recitelabs.dadalink.core.domain.repository.LocationProvider
import org.recitelabs.dadalink.core.domain.repository.SosRelay
import org.recitelabs.dadalink.core.model.GeoPoint
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult

class FakeLocationProvider(var location: GeoPoint? = null) : LocationProvider {
    override suspend fun currentLocation() = location
}

class FakeSosRelay(var result: SosChannelResult = SosChannelResult.Sent(SosChannel.RELAY)) : SosRelay {
    val relayed = mutableListOf<SosAlert>()
    override suspend fun relay(alert: SosAlert): SosChannelResult {
        relayed += alert
        return result
    }
}
