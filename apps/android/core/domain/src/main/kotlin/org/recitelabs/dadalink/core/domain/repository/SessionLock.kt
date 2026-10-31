package org.recitelabs.dadalink.core.domain.repository

import kotlinx.coroutines.flow.StateFlow

/** In-memory unlock state. Locked on start, after quick exit and when the app goes to background. */
interface SessionLock {
    val isUnlocked: StateFlow<Boolean>
    fun unlock()
    fun lock()
}
