package org.recitelabs.dadalink.core.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import org.recitelabs.dadalink.core.datastore.SettingsDataSource
import org.recitelabs.dadalink.core.datastore.StoredContact
import org.recitelabs.dadalink.core.datastore.StoredSettings
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.model.UserSettings
import java.time.Instant
import javax.inject.Inject

class DefaultSettingsRepository @Inject constructor(private val source: SettingsDataSource) : SettingsRepository {

    override val settings: Flow<UserSettings> = source.data.map { it.toModel() }.distinctUntilChanged()

    override suspend fun setLanguage(language: AppLanguage) = source.update { it.copy(languageTag = language.tag) }
    override suspend fun setCountry(country: Country) = source.update { it.copy(countryIso = country.isoCode) }
    override suspend fun setNickname(nickname: String?) = source.update { it.copy(nickname = nickname) }
    override suspend fun setDisguise(mode: DisguiseMode) = source.update { it.copy(disguise = mode.name) }
    override suspend fun setHideNotificationContent(hide: Boolean) = source.update { it.copy(hideNotificationContent = hide) }
    override suspend fun setLastCheckIn(at: Instant) = source.update { it.copy(lastCheckInEpochMillis = at.toEpochMilli()) }
    override suspend fun markOnboarded() = source.update { it.copy(onboarded = true) }
    override suspend fun setTrustedContact(contact: TrustedContact?) = source.update {
        it.copy(contact = contact?.let { c -> StoredContact(c.name, c.relation, c.phone, c.telegram) })
    }
}

internal fun StoredSettings.toModel() = UserSettings(
    isOnboarded = onboarded,
    language = AppLanguage.fromTag(languageTag) ?: AppLanguage.Default,
    nickname = nickname,
    country = Country.fromIso(countryIso) ?: Country.SAUDI_ARABIA,
    disguise = disguise?.let { runCatching { DisguiseMode.valueOf(it) }.getOrNull() } ?: DisguiseMode.NONE,
    hideNotificationContent = hideNotificationContent,
    trustedContact = contact?.let { TrustedContact(it.name, it.relation, it.phone, it.telegram) },
    hasPin = pin != null,
    lastCheckIn = lastCheckInEpochMillis?.let(Instant::ofEpochMilli),
)
