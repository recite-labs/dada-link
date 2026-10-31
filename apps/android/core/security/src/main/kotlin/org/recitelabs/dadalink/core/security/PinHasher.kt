package org.recitelabs.dadalink.core.security

import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import javax.inject.Inject

/** Salted PBKDF2-HMAC-SHA256 hash of the PIN. */
data class PinHash(val salt: ByteArray, val hash: ByteArray, val iterations: Int) {
    override fun equals(other: Any?) = other is PinHash && salt.contentEquals(other.salt) &&
        hash.contentEquals(other.hash) && iterations == other.iterations

    override fun hashCode() = 31 * (31 * salt.contentHashCode() + hash.contentHashCode()) + iterations
}

/**
 * A 4-digit PIN has only 10⁴ values, so hashing cannot stop an attacker who already has the
 * encrypted settings file *and* the Keystore key. Its job is defence in depth: the hash sits inside
 * the Keystore-encrypted settings, and the slow KDF makes on-device guessing costly.
 */
class PinHasher @Inject constructor() {
    private val random = SecureRandom()

    fun hash(pin: String, iterations: Int = DEFAULT_ITERATIONS): PinHash {
        val salt = ByteArray(SALT_BYTES).also(random::nextBytes)
        return PinHash(salt, derive(pin, salt, iterations), iterations)
    }

    fun verify(pin: String, stored: PinHash): Boolean =
        MessageDigest.isEqual(derive(pin, stored.salt, stored.iterations), stored.hash)

    private fun derive(pin: String, salt: ByteArray, iterations: Int): ByteArray {
        val spec = PBEKeySpec(pin.toCharArray(), salt, iterations, HASH_BITS)
        return try {
            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }

    companion object {
        const val DEFAULT_ITERATIONS = 120_000
        private const val SALT_BYTES = 16
        private const val HASH_BITS = 256
    }
}
