package org.recitelabs.dadalink.core.testing.fake

import org.recitelabs.dadalink.core.domain.repository.PinRepository

class FakePinRepository(var pin: String? = null) : PinRepository {
    override suspend fun hasPin() = pin != null
    override suspend fun setPin(pin: String) { this.pin = pin }
    override suspend fun verify(pin: String) = this.pin == pin
}
