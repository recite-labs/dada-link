package org.recitelabs.dadalink

import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.testing.fake.FakeSessionLock
import org.recitelabs.dadalink.lifecycle.AutoLock

class AutoLockTest {
    private var time = 0L
    private val lock = FakeSessionLock(unlocked = true)
    private val autoLock = AutoLock(lock, { time }, graceMillis = 60_000)
    private val owner = object : LifecycleOwner {
        override val lifecycle = LifecycleRegistry.createUnsafe(this)
    }

    @Test fun `short trips (photo picker, share sheet) keep the session`() {
        autoLock.onStop(owner)
        time += 30_000
        autoLock.onStart(owner)
        assertTrue(lock.isUnlocked.value)
    }

    @Test fun `long absences lock`() {
        autoLock.onStop(owner)
        time += 61_000
        autoLock.onStart(owner)
        assertFalse(lock.isUnlocked.value)
    }
}
