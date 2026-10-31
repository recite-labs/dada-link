package org.recitelabs.dadalink.core.data.sos

import android.Manifest
import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.SmsManager
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import org.recitelabs.dadalink.core.domain.repository.SmsGateway
import org.recitelabs.dadalink.core.model.SosChannel
import org.recitelabs.dadalink.core.model.SosChannelResult
import java.util.UUID
import javax.inject.Inject
import kotlin.coroutines.resume

/** Sends SMS from the device's own SIM: works without mobile data, which many users lack. */
class AndroidSmsGateway @Inject constructor(@ApplicationContext private val context: Context) : SmsGateway {

    override fun canSendDirectly(): Boolean =
        context.packageManager.hasSystemFeature(messagingFeature) &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED

    override suspend fun send(phone: String, message: String): SosChannelResult {
        if (!canSendDirectly()) return SosChannelResult.Failed(SosChannel.SMS, "permission not granted")
        val sms = smsManager() ?: return SosChannelResult.Failed(SosChannel.SMS, "no SMS service")
        val parts = sms.divideMessage(message)
        val action = "org.recitelabs.dadalink.SMS_SENT." + UUID.randomUUID()
        // The radio reports per part; we wait for the first report (or time out and assume queued).
        val result = withTimeoutOrNull(SENT_TIMEOUT_MS) {
            suspendCancellableCoroutine { cont ->
                val receiver = object : BroadcastReceiver() {
                    override fun onReceive(ctx: Context, intent: Intent) {
                        runCatching { context.unregisterReceiver(this) }
                        val ok = resultCode == Activity.RESULT_OK
                        if (cont.isActive) {
                            cont.resume(if (ok) SosChannelResult.Sent(SosChannel.SMS) else SosChannelResult.Failed(SosChannel.SMS, "radio error $resultCode"))
                        }
                    }
                }
                ContextCompat.registerReceiver(context, receiver, IntentFilter(action), ContextCompat.RECEIVER_NOT_EXPORTED)
                cont.invokeOnCancellation { runCatching { context.unregisterReceiver(receiver) } }
                val sent = PendingIntent.getBroadcast(
                    context, 0, Intent(action).setPackage(context.packageName),
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_ONE_SHOT,
                )
                try {
                    val intents = ArrayList(parts.map { sent })
                    sms.sendMultipartTextMessage(phone, null, parts, intents, null)
                } catch (e: RuntimeException) {
                    runCatching { context.unregisterReceiver(receiver) }
                    if (cont.isActive) cont.resume(SosChannelResult.Failed(SosChannel.SMS, e.javaClass.simpleName))
                }
            }
        }
        return result ?: SosChannelResult.Queued(SosChannel.SMS)
    }

    private fun smsManager(): SmsManager? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        context.getSystemService(SmsManager::class.java)
    } else {
        @Suppress("DEPRECATION")
        SmsManager.getDefault()
    }

    private companion object {
        const val SENT_TIMEOUT_MS = 20_000L

        val messagingFeature: String = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            PackageManager.FEATURE_TELEPHONY_MESSAGING
        } else {
            PackageManager.FEATURE_TELEPHONY
        }
    }
}
