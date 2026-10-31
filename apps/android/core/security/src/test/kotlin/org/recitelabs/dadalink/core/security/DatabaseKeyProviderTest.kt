package org.recitelabs.dadalink.core.security

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class DatabaseKeyProviderTest {
    @get:Rule val tmp = TemporaryFolder()

    @Test fun `generates once, stores only the wrapped key, then reuses it`() {
        val file = File(tmp.root, "keys/db.key")
        val cipher = TestCipher()

        val first = DatabaseKeyProvider(cipher, file).passphrase()
        val second = DatabaseKeyProvider(cipher, file).passphrase()

        assertEquals(32, first.size)
        assertArrayEquals(first, second)
        assertTrue(file.exists())
        assertFalse("raw key must never hit the disk", file.readBytes().contentEquals(first))
    }
}
