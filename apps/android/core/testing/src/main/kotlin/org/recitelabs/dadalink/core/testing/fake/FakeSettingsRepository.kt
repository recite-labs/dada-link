package org.recitelabs.dadalink.core.testing.fake

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.model.UserSettings
import java.time.Instant

class FakeSettingsRepository(initial: UserSettings = UserSettings()) : SettingsRepository {
    val state = MutableStateFlow(initial)
    override val settings: Flow<UserSettings> = state

    override suspend fun setLanguage(language: AppLanguage) = state.update { it.copy(language = language) }
    override suspend fun setCountry(country: Country) = state.update { it.copy(country = country) }
    override suspend fun setNickname(nickname: String?) = state.update { it.copy(nickname = nickname) }
    override suspend fun setDisguise(mode: DisguiseMode) = state.update { it.copy(disguise = mode) }
    override suspend fun setHideNotificationContent(hide: Boolean) = state.update { it.copy(hideNotificationContent = hide) }
    override suspend fun setTrustedContact(contact: TrustedContact?) = state.update { it.copy(trustedContact = contact) }
    override suspend fun setLastCheckIn(at: Instant) = state.update { it.copy(lastCheckIn = at) }
    override suspend fun markOnboarded() = state.update { it.copy(isOnboarded = true) }
}
