package org.recitelabs.dadalink.core.security

import java.io.File
import java.security.SecureRandom

/**
 * Supplies the SQLCipher passphrase. On first use a random 256-bit key is generated, wrapped with a
 * Keystore key ([wrapper]) and stored in app-private no-backup storage. The raw key only ever
 * exists in memory.
 */
class DatabaseKeyProvider(
    private val wrapper: SecretCipher,
    private val wrappedKeyFile: File,
    private val random: SecureRandom = SecureRandom(),
) {
    @Synchronized
    fun passphrase(): ByteArray {
        if (wrappedKeyFile.exists()) return wrapper.decrypt(wrappedKeyFile.readBytes())

        val key = ByteArray(KEY_BYTES).also(random::nextBytes)
        wrappedKeyFile.parentFile?.mkdirs()
        val tmp = File(wrappedKeyFile.parentFile, wrappedKeyFile.name + ".tmp")
        tmp.writeBytes(wrapper.encrypt(key))
        check(tmp.renameTo(wrappedKeyFile)) { "Could not persist database key" }
        return key
    }

    private companion object {
        const val KEY_BYTES = 32
    }
}
