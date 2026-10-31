package org.recitelabs.dadalink.core.data.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.network.ApiException
import java.io.IOException

/** Syncs help numbers and content for the user's current country and language. */
@HiltWorker
class ContentSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val settings: SettingsRepository,
    private val syncer: ContentSyncer,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val current = settings.settings.first()
        return try {
            syncer.sync(current.country, current.language)
            Result.success()
        } catch (_: ApiException.Malformed) {
            Result.failure() // contract mismatch: retrying will not help; the stored copy stays.
        } catch (_: IOException) {
            if (runAttemptCount < MAX_ATTEMPTS) Result.retry() else Result.failure()
        }
    }

    private companion object {
        const val MAX_ATTEMPTS = 6
    }
}
