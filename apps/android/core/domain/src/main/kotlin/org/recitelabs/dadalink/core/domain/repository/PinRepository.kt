package org.recitelabs.dadalink.core.domain.repository

/** Stores a salted, slow hash of the app PIN — never the PIN itself. */
interface PinRepository {
    suspend fun hasPin(): Boolean
    suspend fun setPin(pin: String)
    suspend fun verify(pin: String): Boolean
}
