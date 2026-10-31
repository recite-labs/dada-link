package org.recitelabs.dadalink.core.data.device

import kotlinx.coroutines.flow.first
import org.recitelabs.dadalink.core.datastore.SettingsDataSource
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * The install's random id, stored in the encrypted settings file. The backend uses it only to
 * count questions/alerts per device; nothing else identifying is ever sent.
 */
@Singleton
class DeviceIdProvider @Inject constructor(private val settings: SettingsDataSource) {

    suspend fun deviceId(): String {
        settings.data.first().deviceId?.takeIf(::isValid)?.let { return it }
        // Generated inside the update so two concurrent first calls agree on one id.
        settings.update { current -> if (current.deviceId?.let(::isValid) == true) current else current.copy(deviceId = UUID.randomUUID().toString()) }
        return checkNotNull(settings.data.first().deviceId)
    }

    private companion object {
        /** `DeviceId` pattern in openapi.json accepts RFC 4122 UUIDs; `randomUUID` is version 4. */
        val UUID_V4 = Regex("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")

        fun isValid(id: String) = UUID_V4.matches(id)
    }
}
