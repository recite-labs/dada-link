package org.recitelabs.dadalink.core.security

import java.nio.ByteBuffer
import java.security.GeneralSecurityException
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * AES-GCM framing shared by the Keystore cipher and tests:
 * `[version:1][ivLength:1][iv][ciphertext‖tag]`.
 */
internal object AesGcm {
    private const val VERSION: Byte = 1
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val TAG_BITS = 128

    fun encrypt(key: SecretKey, plaintext: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key) // provider generates a fresh random IV
        val iv = cipher.iv
        val body = cipher.doFinal(plaintext)
        return ByteBuffer.allocate(2 + iv.size + body.size)
            .put(VERSION)
            .put(iv.size.toByte())
            .put(iv)
            .put(body)
            .array()
    }

    fun decrypt(key: SecretKey, data: ByteArray): ByteArray {
        if (data.size < 2 || data[0] != VERSION) throw GeneralSecurityException("Unknown ciphertext format")
        val ivLength = data[1].toInt()
        if (ivLength !in 12..16 || data.size < 2 + ivLength + TAG_BITS / 8) {
            throw GeneralSecurityException("Malformed ciphertext")
        }
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(TAG_BITS, data, 2, ivLength))
        return cipher.doFinal(data, 2 + ivLength, data.size - 2 - ivLength)
    }
}
