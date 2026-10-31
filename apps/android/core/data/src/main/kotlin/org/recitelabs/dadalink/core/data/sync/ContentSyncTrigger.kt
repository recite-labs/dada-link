package org.recitelabs.dadalink.core.data.sync

import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.common.ApplicationScope
import org.recitelabs.dadalink.core.data.BuildConfig
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Started once from the Application: keeps the daily sync scheduled and syncs right away when the
 * stored copy for the current country/language is missing or stale (first run, country change).
 */
@Singleton
class ContentSyncTrigger @Inject constructor(
    private val settings: SettingsRepository,
    private val syncer: ContentSyncer,
    private val scheduler: ContentSyncScheduler,
    @ApplicationScope private val scope: CoroutineScope,
) {
    fun start() {
        if (BuildConfig.USE_FAKE_BACKEND) return
        scheduler.schedulePeriodic()
        scope.launch {
            settings.settings
                .map { it.country to it.language }
                .distinctUntilChanged()
                .collect { (country, language) ->
                    val stale = try {
                        syncer.isStale(country, language)
                    } catch (e: CancellationException) {
                        throw e
                    } catch (_: Throwable) {
                        true // DB unavailable: let the worker try (and fail) on its own schedule.
                    }
                    if (stale) scheduler.syncNow()
                }
        }
    }
}
