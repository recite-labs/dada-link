package org.recitelabs.dadalink.core.ui

import android.view.WindowManager
import androidx.activity.compose.LocalActivity
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect

/**
 * Marks the current window FLAG_SECURE while this composable is in composition: no screenshots,
 * no screen recording, and a blank thumbnail in Recents. Use on screens showing private data
 * (log, assistant conversation, SOS).
 */
@Composable
fun SecureScreen() {
    val window = LocalActivity.current?.window ?: return
    DisposableEffect(window) {
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        onDispose { window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE) }
    }
}
