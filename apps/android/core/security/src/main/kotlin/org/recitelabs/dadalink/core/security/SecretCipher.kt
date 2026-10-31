package org.recitelabs.dadalink.core.security

/** Authenticated symmetric encryption. Output is self-describing (contains its IV). */
interface SecretCipher {
    fun encrypt(plaintext: ByteArray): ByteArray

    /** @throws java.security.GeneralSecurityException if the data was tampered with or the key is gone. */
    fun decrypt(ciphertext: ByteArray): ByteArray
}
