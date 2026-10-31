package org.recitelabs.dadalink.core.model

import java.time.Instant

/** How the app appears in the launcher. */
enum class DisguiseMode { CALCULATOR, NOTES, NONE }

/** Someone the user trusts. At least one of [phone] or [telegram] is required. */
data class TrustedContact(
    val name: String,
    val relation: String,
    val phone: String?,
    val telegram: String?,
)

/** Everything the user configured; persisted encrypted on the device only. */
data class UserSettings(
    val isOnboarded: Boolean = false,
    val language: AppLanguage = AppLanguage.Default,
    val nickname: String? = null,
    val country: Country = Country.SAUDI_ARABIA,
    val disguise: DisguiseMode = DisguiseMode.NONE,
    val hideNotificationContent: Boolean = true,
    val trustedContact: TrustedContact? = null,
    val hasPin: Boolean = false,
    val lastCheckIn: Instant? = null,
)

enum class Mood { GOOD, TIRED, LOW, NOT_SAFE }

data class GeoPoint(val latitude: Double, val longitude: Double, val accuracyMeters: Float?)
