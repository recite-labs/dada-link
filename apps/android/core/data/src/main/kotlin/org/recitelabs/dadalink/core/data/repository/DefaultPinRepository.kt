package org.recitelabs.dadalink.core.data.repository

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import org.recitelabs.dadalink.core.common.DadaDispatchers
import org.recitelabs.dadalink.core.common.Dispatcher
import org.recitelabs.dadalink.core.datastore.SettingsDataSource
import org.recitelabs.dadalink.core.datastore.StoredPin
import org.recitelabs.dadalink.core.domain.repository.PinRepository
import org.recitelabs.dadalink.core.security.PinHash
import org.recitelabs.dadalink.core.security.PinHasher
import java.util.Base64
import javax.inject.Inject

class DefaultPinRepository @Inject constructor(
    private val source: SettingsDataSource,
    private val hasher: PinHasher,
    @Dispatcher(DadaDispatchers.Default) private val cpu: CoroutineDispatcher,
) : PinRepository {
    private val b64e = Base64.getEncoder()
    private val b64d = Base64.getDecoder()

    override suspend fun hasPin(): Boolean = source.data.first().pin != null

    override suspend fun setPin(pin: String) {
        val hash = withContext(cpu) { hasher.hash(pin) }
        source.update { it.copy(pin = StoredPin(b64e.encodeToString(hash.salt), b64e.encodeToString(hash.hash), hash.iterations)) }
    }

    override suspend fun verify(pin: String): Boolean {
        val stored = source.data.first().pin ?: return false
        val hash = PinHash(b64d.decode(stored.saltB64), b64d.decode(stored.hashB64), stored.iterations)
        return withContext(cpu) { hasher.verify(pin, hash) }
    }
}
