package org.recitelabs.dadalink.core.data.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.recitelabs.dadalink.core.domain.repository.SessionLock
import javax.inject.Inject
import javax.inject.Singleton

/** Never persisted: a process death always means "locked". */
@Singleton
class InMemorySessionLock @Inject constructor() : SessionLock {
    private val state = MutableStateFlow(false)
    override val isUnlocked: StateFlow<Boolean> = state.asStateFlow()
    override fun unlock() { state.value = true }
    override fun lock() { state.value = false }
}
