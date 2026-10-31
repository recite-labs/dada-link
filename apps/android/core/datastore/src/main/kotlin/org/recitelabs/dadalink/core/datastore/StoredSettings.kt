package org.recitelabs.dadalink.core.datastore

import kotlinx.serialization.Serializable

/** On-disk shape of the settings file (JSON, then AES-GCM encrypted as a whole). */
@Serializable
data class StoredSettings(
    val schemaVersion: Int = 1,
    val onboarded: Boolean = false,
    val languageTag: String? = null,
    val nickname: String? = null,
    val countryIso: String? = null,
    val disguise: String? = null,
    val hideNotificationContent: Boolean = true,
    val contact: StoredContact? = null,
    val pin: StoredPin? = null,
    val lastCheckInEpochMillis: Long? = null,
    /** Journey phase wire value (`before`/`abroad`/`return`). */
    val phase: String? = null,
    /**
     * Random UUID generated on first use. Sent to the API only for per-device quotas; it is not
     * derived from the hardware or any account and is reset if this file is ever reset.
     */
    val deviceId: String? = null,
)

@Serializable
data class StoredContact(val name: String, val relation: String, val phone: String? = null, val telegram: String? = null)

@Serializable
data class StoredPin(val saltB64: String, val hashB64: String, val iterations: Int)
