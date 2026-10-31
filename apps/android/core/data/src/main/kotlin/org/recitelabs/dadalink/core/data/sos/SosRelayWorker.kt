package org.recitelabs.dadalink.core.data.sos

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.serialization.SerializationException
import org.recitelabs.dadalink.core.data.R
import org.recitelabs.dadalink.core.data.notification.DiscreetNotifier
import org.recitelabs.dadalink.core.network.ApiException
import org.recitelabs.dadalink.core.network.SosApi
import org.recitelabs.dadalink.core.network.di.DadaJson
import org.recitelabs.dadalink.core.network.model.SosRequestDto
import org.recitelabs.dadalink.core.security.di.QueueCipher
import org.recitelabs.dadalink.core.security.SecretCipher
import java.io.IOException
import java.security.GeneralSecurityException
import java.util.Base64

/**
 * Delivers a queued SOS relay once the phone is back online. Retries only connectivity failures
 * (gives up after ~a day); a server answer that it could not deliver is final.
 */
@HiltWorker
class SosRelayWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val api: SosApi,
    @QueueCipher private val cipher: SecretCipher,
    private val notifier: DiscreetNotifier,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val encoded = inputData.getString(KEY_PAYLOAD) ?: return Result.failure()
        val request = try {
            DadaJson.decodeFromString(SosRequestDto.serializer(), cipher.decrypt(Base64.getDecoder().decode(encoded)).decodeToString())
        } catch (_: GeneralSecurityException) {
            return Result.failure()
        } catch (_: SerializationException) {
            return Result.failure() // queued by an older build with another payload shape
        } catch (_: IllegalArgumentException) {
            return Result.failure()
        }
        return try {
            val result = api.relay(request)
            if (result.deliveredVia.isEmpty()) return Result.failure()
            notifier.notify(DiscreetNotifier.ID_RELAY, applicationContext.getString(R.string.data_notification_relay_delivered))
            Result.success()
        } catch (_: ApiException) {
            Result.failure()
        } catch (_: IOException) {
            if (runAttemptCount < MAX_ATTEMPTS) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val KEY_PAYLOAD = "payload"
        const val UNIQUE_NAME = "sos-relay"
        private const val MAX_ATTEMPTS = 12
    }
}
