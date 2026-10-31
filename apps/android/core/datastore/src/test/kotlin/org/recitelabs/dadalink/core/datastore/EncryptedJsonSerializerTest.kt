package org.recitelabs.dadalink.core.datastore

import androidx.datastore.core.CorruptionException
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test
import org.recitelabs.dadalink.core.security.SecretCipher
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.security.GeneralSecurityException

class EncryptedJsonSerializerTest {
    /** Reversible, obviously-not-plaintext transform; real AES-GCM is covered in core:security. */
    private class XorCipher : SecretCipher {
        override fun encrypt(plaintext: ByteArray) = byteArrayOf(0x42) + plaintext.map { (it.toInt() xor 0x5A).toByte() }
        override fun decrypt(ciphertext: ByteArray): ByteArray {
            if (ciphertext.firstOrNull() != 0x42.toByte()) throw GeneralSecurityException("bad")
            return ciphertext.drop(1).map { (it.toInt() xor 0x5A).toByte() }.toByteArray()
        }
    }

    private val serializer = EncryptedJsonSerializer(XorCipher(), StoredSettings.serializer(), StoredSettings())

    @Test fun `round trips and never writes plaintext`() = runTest {
        val value = StoredSettings(onboarded = true, nickname = "Meron", contact = StoredContact("Almaz", "Sister", "+251911000000"))
        val out = ByteArrayOutputStream()
        serializer.writeTo(value, out)

        assertFalse(out.toString(Charsets.UTF_8).contains("Almaz"))
        assertEquals(value, serializer.readFrom(ByteArrayInputStream(out.toByteArray())))
    }

    @Test fun `empty file yields defaults`() = runTest {
        assertEquals(StoredSettings(), serializer.readFrom(ByteArrayInputStream(ByteArray(0))))
    }

    @Test(expected = CorruptionException::class)
    fun `undecryptable file is reported as corruption`() = runTest {
        serializer.readFrom(ByteArrayInputStream(byteArrayOf(1, 2, 3)))
    }
}
