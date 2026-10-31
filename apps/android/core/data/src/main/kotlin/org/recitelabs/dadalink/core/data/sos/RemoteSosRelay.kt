package org.recitelabs.dadalink.core.data.sos

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.domain.repository.SosRelay
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.core.network.SosApi
import org.recitelabs.dadalink.core.network.model.SosRelayRequestDto
import org.recitelabs.dadalink.core.security.di.QueueCipher
import org.recitelabs.dadalink.core.security.SecretCipher
import java.io.IOException
import java.util.Base64
import java.util.concurrent.TimeUnit
import javax.inject.Inject

/**
 * Tries the server relay immediately; if offline, queues it in WorkManager. The queued payload is
 * encrypted with a Keystore key because WorkManager's own database is plaintext.
 */
class RemoteSosRelay @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: SosApi,
    @QueueCipher private val cipher: SecretCipher,
) : SosRelay {

    override suspend fun relay(alert: SosAlert): SosChannelResult {
        val request = alert.toRequest()
        return try {
            api.relay(request)
            SosChannelResult.Sent(SosChannel.RELAY)
        } catch (_: IOException) {
            enqueue(request)
            SosChannelResult.Queued(SosChannel.RELAY)
        }
    }

    private fun enqueue(request: SosRelayRequestDto) {
        val payload = Base64.getEncoder().encodeToString(cipher.encrypt(Json.encodeToString(SosRelayRequestDto.serializer(), request).encodeToByteArray()))
        val work = OneTimeWorkRequestBuilder<SosRelayWorker>()
            .setInputData(workDataOf(SosRelayWorker.KEY_PAYLOAD to payload))
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(SosRelayWorker.UNIQUE_NAME, ExistingWorkPolicy.REPLACE, work)
    }
}

internal fun SosAlert.toRequest() = SosRelayRequestDto(
    message = message,
    contactPhone = contact.phone,
    contactTelegram = contact.telegram,
    latitude = location?.latitude,
    longitude = location?.longitude,
)
