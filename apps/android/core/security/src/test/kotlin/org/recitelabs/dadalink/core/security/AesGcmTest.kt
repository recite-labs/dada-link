package org.recitelabs.dadalink.core.security

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertFalse
import org.junit.Test
import java.security.GeneralSecurityException

class AesGcmTest {
    private val cipher = TestCipher()

    @Test fun `round trips`() {
        val plain = "ደሞዝ 1000 SAR".toByteArray()
        assertArrayEquals(plain, cipher.decrypt(cipher.encrypt(plain)))
    }

    @Test fun `uses a fresh iv every time`() {
        val plain = byteArrayOf(1, 2, 3)
        assertFalse(cipher.encrypt(plain).contentEquals(cipher.encrypt(plain)))
    }

    @Test(expected = GeneralSecurityException::class)
    fun `detects tampering`() {
        val data = cipher.encrypt("secret".toByteArray())
        data[data.size - 1] = (data[data.size - 1].toInt() xor 1).toByte()
        cipher.decrypt(data)
    }

    @Test(expected = GeneralSecurityException::class)
    fun `rejects foreign data`() {
        cipher.decrypt(byteArrayOf(9, 9, 9))
    }
}
