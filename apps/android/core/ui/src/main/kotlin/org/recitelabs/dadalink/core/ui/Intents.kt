package org.recitelabs.dadalink.core.ui

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PersistableBundle
import androidx.core.content.getSystemService

/** Opens the dialer with [number] pre-filled. Uses ACTION_DIAL: no CALL_PHONE permission needed. */
fun Context.dial(number: String): Boolean = startSafely(Intent(Intent.ACTION_DIAL, Uri.fromParts("tel", number, null)))

/** Opens the SMS app addressed to [number] with [body]; the user presses send. */
fun Context.composeSms(number: String, body: String): Boolean = startSafely(
    Intent(Intent.ACTION_SENDTO, Uri.fromParts("smsto", number, null)).putExtra("sms_body", body),
)

/** Share sheet with plain text (Telegram, WhatsApp, SMS…). */
fun Context.shareText(text: String, chooserTitle: String): Boolean {
    val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
    return startSafely(Intent.createChooser(send, chooserTitle))
}

/** Copies [text]; flagged sensitive so Android 13+ does not show it in the clipboard preview. */
fun Context.copyToClipboard(label: String, text: String, sensitive: Boolean = false) {
    val clip = ClipData.newPlainText(label, text)
    if (sensitive && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        clip.description.extras = PersistableBundle().apply {
            putBoolean(android.content.ClipDescription.EXTRA_IS_SENSITIVE, true)
        }
    }
    getSystemService<ClipboardManager>()?.setPrimaryClip(clip)
}

private fun Context.startSafely(intent: Intent): Boolean = try {
    if (this !is android.app.Activity) intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    startActivity(intent)
    true
} catch (_: ActivityNotFoundException) {
    false
}
