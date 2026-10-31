package org.recitelabs.dadalink.core.data.sync

import dagger.Lazy
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import org.recitelabs.dadalink.core.common.DadaDispatchers
import org.recitelabs.dadalink.core.common.Dispatcher
import org.recitelabs.dadalink.core.data.wireLocale
import org.recitelabs.dadalink.core.database.DadaDatabase
import org.recitelabs.dadalink.core.database.model.ContentEntity
import org.recitelabs.dadalink.core.database.model.DirectoryEntryEntity
import org.recitelabs.dadalink.core.database.model.SyncStateEntity
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.network.ContentApi
import org.recitelabs.dadalink.core.network.model.DirectoryEntryDto
import org.recitelabs.dadalink.core.network.model.LocalizedContentDto
import java.time.Clock
import java.time.Duration
import javax.inject.Inject

/**
 * Pulls the help directory and the reviewed content for the user's country and language into the
 * encrypted database. Order matters: help numbers first, so they are stored even if the (larger)
 * content download fails. Each scope is swapped atomically; a failure leaves the previous copy.
 *
 * Content is fetched for the whole locale (≈60 items), not only the user's country: the Return
 * and Before-you-go sections need Ethiopia-specific items, and filtering happens on device.
 */
class ContentSyncer @Inject constructor(
    private val api: ContentApi,
    private val database: Lazy<DadaDatabase>,
    private val clock: Clock,
    @Dispatcher(DadaDispatchers.IO) private val io: CoroutineDispatcher,
) {
    private suspend fun dao() = withContext(io) { database.get().contentDao() }

    /** @throws java.io.IOException when offline or the server failed; the worker retries. */
    suspend fun sync(country: Country, language: AppLanguage) {
        // Ethiopia's directory backs the "Coming home" returnee services.
        for (c in linkedSetOf(country, Country.ETHIOPIA)) syncDirectory(c)
        syncContent(language.wireLocale)
    }

    suspend fun isStale(country: Country, language: AppLanguage, maxAge: Duration = MAX_AGE): Boolean {
        val dao = dao()
        val oldest = listOf(directoryScope(country), contentScope(language.wireLocale)).map { dao.syncedAt(it) ?: return true }.min()
        return clock.millis() - oldest > maxAge.toMillis()
    }

    private suspend fun syncDirectory(country: Country) {
        val entries = api.directory(country.isoCode)
        val dao = dao()
        dao.replaceDirectory(country.isoCode, entries.mapIndexed { i, dto -> dto.toEntity(i) })
        if (entries.isNotEmpty()) dao.markSynced(SyncStateEntity(directoryScope(country), clock.millis()))
    }

    private suspend fun syncContent(locale: String) {
        val summaries = api.list(locale = locale)
        if (summaries.isEmpty()) return
        val items = coroutineScope {
            summaries.chunked(PARALLEL_DOWNLOADS).flatMap { chunk ->
                chunk.map { async { api.item(it.id, locale) } }.awaitAll()
            }
        }
        val rows = items.filterNotNull().mapIndexed { i, dto -> dto.toEntity(locale, i) }
        val dao = dao()
        dao.replaceContent(locale, rows)
        dao.markSynced(SyncStateEntity(contentScope(locale), clock.millis()))
    }

    companion object {
        val MAX_AGE: Duration = Duration.ofHours(12)
        private const val PARALLEL_DOWNLOADS = 4

        fun directoryScope(country: Country) = "directory:${country.isoCode}"
        fun contentScope(locale: String) = "content:$locale"
    }
}

internal fun DirectoryEntryDto.toEntity(position: Int) = DirectoryEntryEntity(
    id = id,
    country = country,
    kind = kind,
    name = name,
    nameAm = names?.am,
    nameOm = names?.om,
    nameEn = names?.en,
    nameSw = names?.sw,
    nameTi = names?.ti,
    phone = phone,
    shortCode = shortCode,
    city = city,
    hours = hours,
    notes = notes,
    emergency = emergency,
    verified = verified,
    lastVerified = lastVerified,
    position = position,
)

internal fun LocalizedContentDto.toEntity(requestedLocale: String, position: Int) = ContentEntity(
    id = id,
    locale = requestedLocale,
    contentLocale = locale,
    kind = kind,
    phase = phase,
    countries = countries.joinToString(","),
    topics = topics.joinToString(","),
    status = status,
    title = title,
    summary = summary,
    body = body,
    sensitive = sensitive,
    position = position,
)
