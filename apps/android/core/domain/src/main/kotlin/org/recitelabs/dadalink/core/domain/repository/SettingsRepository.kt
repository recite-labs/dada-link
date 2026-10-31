package org.recitelabs.dadalink.core.domain.repository

import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.JourneyPhase
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.model.UserSettings
import java.time.Instant

/** User preferences and safety setup. Implementations must store everything encrypted on device. */
interface SettingsRepository {
    val settings: Flow<UserSettings>

    suspend fun setLanguage(language: AppLanguage)
    suspend fun setCountry(country: Country)
    suspend fun setPhase(phase: JourneyPhase)
    suspend fun setNickname(nickname: String?)
    suspend fun setDisguise(mode: DisguiseMode)
    suspend fun setHideNotificationContent(hide: Boolean)
    suspend fun setTrustedContact(contact: TrustedContact?)
    suspend fun setLastCheckIn(at: Instant)
    suspend fun markOnboarded()
}
