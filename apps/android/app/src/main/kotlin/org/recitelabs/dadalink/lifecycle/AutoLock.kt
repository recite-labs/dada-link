package org.recitelabs.dadalink.lifecycle

import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import org.recitelabs.dadalink.core.domain.repository.SessionLock

/**
 * Locks the session when the app comes back after being in the background longer than
 * [graceMillis]. The grace period lets users pick a photo or answer the share sheet without
 * having to re-enter the PIN; the Hide button always locks immediately.
 */
class AutoLock(
    private val sessionLock: SessionLock,
    private val now: () -> Long,
    private val graceMillis: Long = DEFAULT_GRACE_MILLIS,
) : DefaultLifecycleObserver {
    private var backgroundedAt: Long? = null

    override fun onStop(owner: LifecycleOwner) {
        backgroundedAt = now()
    }

    override fun onStart(owner: LifecycleOwner) {
        val since = backgroundedAt ?: return
        backgroundedAt = null
        if (now() - since > graceMillis) sessionLock.lock()
    }

    companion object {
        const val DEFAULT_GRACE_MILLIS = 60_000L
    }
}
