package org.recitelabs.dadalink.core.security

import javax.crypto.KeyGenerator

/** Real AES-GCM with an in-memory key (the Android Keystore is not available on the JVM). */
class TestCipher : SecretCipher {
    private val key = KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()
    override fun encrypt(plaintext: ByteArray) = AesGcm.encrypt(key, plaintext)
    override fun decrypt(ciphertext: ByteArray) = AesGcm.decrypt(key, ciphertext)
}
