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
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withTimeout
import org.recitelabs.dadalink.core.data.device.DeviceIdProvider
import org.recitelabs.dadalink.core.data.wireLocale
import org.recitelabs.dadalink.core.domain.repository.SosRelay
import org.recitelabs.dadalink.core.model.SosAlert
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.core.network.ApiException
import org.recitelabs.dadalink.core.network.SosApi
import org.recitelabs.dadalink.core.network.di.DadaJson
import org.recitelabs.dadalink.core.network.model.GeoLocationDto
import org.recitelabs.dadalink.core.network.model.SosRequestDto
import org.recitelabs.dadalink.core.network.model.TrustedContactDto
import org.recitelabs.dadalink.core.security.SecretCipher
import org.recitelabs.dadalink.core.security.di.QueueCipher
import java.io.IOException
import java.util.Base64
import java.util.concurrent.TimeUnit
import javax.inject.Inject

/**
 * SOS relay via `POST /safety/sos`. Tries now; if offline, or the server has not answered within
 * [ANSWER_TIMEOUT_MS] (the SMS app must not wait on a slow network), queues it in WorkManager with the payload encrypted by a Keystore key (WorkManager's
 * own database is plaintext). If the server answered but could not deliver (503/429/400) we do not
 * retry: the result is reported as failed and the SMS app / share sheet remain the user's channel.
 * Never throws: an SOS must not crash because of the relay.
 */
class RemoteSosRelay @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: SosApi,
    private val deviceIds: DeviceIdProvider,
    @QueueCipher private val cipher: SecretCipher,
) : SosRelay {

    override suspend fun relay(alert: SosAlert): SosChannelResult {
        return try {
            val request = alert.toRequest(deviceIds.deviceId())
                ?: return SosChannelResult.Failed(SosChannel.RELAY, "contact has no international number or Telegram chat id")
            try {
                val result = withTimeout(ANSWER_TIMEOUT_MS) { api.relay(request) }
                if (result.deliveredVia.isNotEmpty()) {
                    SosChannelResult.Sent(SosChannel.RELAY)
                } else {
                    SosChannelResult.Failed(SosChannel.RELAY, "relay could not deliver")
                }
            } catch (e: ApiException) {
                SosChannelResult.Failed(SosChannel.RELAY, e.message ?: "relay refused")
            } catch (_: IOException) {
                enqueue(request)
                SosChannelResult.Queued(SosChannel.RELAY)
            } catch (_: TimeoutCancellationException) {
                enqueue(request)
                SosChannelResult.Queued(SosChannel.RELAY)
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            SosChannelResult.Failed(SosChannel.RELAY, e.message ?: "relay error")
        }
    }

    private companion object {
        const val ANSWER_TIMEOUT_MS = 10_000L
    }

    private fun enqueue(request: SosRequestDto) {
        val json = DadaJson.encodeToString(SosRequestDto.serializer(), request)
        val payload = Base64.getEncoder().encodeToString(cipher.encrypt(json.encodeToByteArray()))
        val work = OneTimeWorkRequestBuilder<SosRelayWorker>()
            .setInputData(workDataOf(SosRelayWorker.KEY_PAYLOAD to payload))
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()
        WorkManager.getInstance(context).enqueueUniqueWork(SosRelayWorker.UNIQUE_NAME, ExistingWorkPolicy.REPLACE, work)
    }
}

/** `SosRequest`, or null when the contact has no channel the server can use. */
internal fun SosAlert.toRequest(deviceId: String): SosRequestDto? {
    val phone = contact.phone?.let(::toE164)
    val chatId = contact.telegram?.trim()?.takeIf { TELEGRAM_CHAT_ID.matches(it) }?.toLongOrNull()
    if (phone == null && chatId == null) return null
    return SosRequestDto(
        deviceId = deviceId,
        locale = language.wireLocale,
        country = country?.isoCode,
        trustedContact = TrustedContactDto(phone = phone, telegramChatId = chatId),
        message = note.trim().take(MAX_MESSAGE).ifEmpty { null },
        location = location?.let { GeoLocationDto(it.latitude, it.longitude, it.accuracyMeters?.toDouble()?.coerceAtLeast(0.0)) },
    )
}

/** Strict E.164 (`+` then 7–15 digits) as `E164PhoneNumber` requires; `00` prefixes become `+`. */
internal fun toE164(raw: String): String? {
    val compact = raw.filterNot { it == ' ' || it == '-' || it == '(' || it == ')' || it == '.' }
    val plus = if (compact.startsWith("00")) "+" + compact.drop(2) else compact
    return plus.takeIf { E164.matches(it) }
}

private val E164 = Regex("^\\+[1-9][0-9]{6,14}$")
private val TELEGRAM_CHAT_ID = Regex("^-?[0-9]{1,16}$")

/** `MAX_SOS_MESSAGE_LENGTH` in packages/domain. */
private const val MAX_MESSAGE = 500
