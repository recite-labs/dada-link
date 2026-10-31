package org.recitelabs.dadalink.core.security

import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PinHasherTest {
    private val hasher = PinHasher()

    @Test fun `verifies the right pin only`() {
        val stored = hasher.hash("2071", iterations = 1_000)
        assertTrue(hasher.verify("2071", stored))
        assertFalse(hasher.verify("2070", stored))
    }

    @Test fun `salts every hash`() {
        assertNotEquals(hasher.hash("2071", 1_000), hasher.hash("2071", 1_000))
    }
}
