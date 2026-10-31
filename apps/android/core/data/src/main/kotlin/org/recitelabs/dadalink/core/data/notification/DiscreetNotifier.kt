package org.recitelabs.dadalink.core.data.notification

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import org.recitelabs.dadalink.core.data.R
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import javax.inject.Inject

/**
 * The only way DadaLink posts notifications. Never shows content on the lock screen
 * (VISIBILITY_SECRET + a generic public version), and when "hide notification text" is on the
 * notification itself only says "Update". No app name or logo beyond the system minimum.
 */
class DiscreetNotifier @Inject constructor(
    @ApplicationContext private val context: Context,
    private val settings: SettingsRepository,
) {
    suspend fun notify(id: Int, text: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        ensureChannel()
        val generic = context.getString(R.string.data_notification_generic)
        val hide = settings.settings.first().hideNotificationContent
        val publicVersion = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_more)
            .setContentTitle(generic)
            .build()
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_more)
            .setContentTitle(generic)
            .apply { if (!hide) setContentText(text) }
            .setVisibility(NotificationCompat.VISIBILITY_SECRET)
            .setPublicVersion(publicVersion)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setAutoCancel(true)
            .build()
        NotificationManagerCompat.from(context).notify(id, notification)
    }

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(CHANNEL_ID, context.getString(R.string.data_notification_channel), NotificationManager.IMPORTANCE_LOW).apply {
            lockscreenVisibility = android.app.Notification.VISIBILITY_SECRET
            setShowBadge(false)
        }
        context.getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
    }

    companion object {
        const val CHANNEL_ID = "general"
        const val ID_RELAY = 1001
    }
}
