package org.recitelabs.dadalink.core.testing.fake

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.recitelabs.dadalink.core.domain.repository.SessionLock

class FakeSessionLock(unlocked: Boolean = false) : SessionLock {
    private val state = MutableStateFlow(unlocked)
    override val isUnlocked: StateFlow<Boolean> = state
    override fun unlock() { state.value = true }
    override fun lock() { state.value = false }
}
