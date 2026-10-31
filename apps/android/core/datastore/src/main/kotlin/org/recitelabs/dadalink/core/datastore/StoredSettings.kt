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
)

@Serializable
data class StoredContact(val name: String, val relation: String, val phone: String? = null, val telegram: String? = null)

@Serializable
data class StoredPin(val saltB64: String, val hashB64: String, val iterations: Int)
