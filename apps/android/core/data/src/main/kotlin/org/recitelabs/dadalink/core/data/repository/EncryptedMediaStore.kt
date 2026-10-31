package org.recitelabs.dadalink.core.data.repository

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import org.recitelabs.dadalink.core.security.di.MediaCipher
import org.recitelabs.dadalink.core.security.SecretCipher
import java.io.File
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/** Photos for the private log, AES-GCM encrypted in app-private no-backup storage. */
@Singleton
class EncryptedMediaStore @Inject constructor(
    @ApplicationContext context: Context,
    @MediaCipher private val cipher: SecretCipher,
) {
    private val dir = File(context.noBackupFilesDir, "log_media")

    fun put(bytes: ByteArray): String {
        dir.mkdirs()
        val id = UUID.randomUUID().toString()
        File(dir, "$id.bin").writeBytes(cipher.encrypt(bytes))
        return id
    }

    fun get(id: String): ByteArray? {
        if (!ID.matches(id)) return null // never let an id escape the directory
        val file = File(dir, "$id.bin")
        return if (file.exists()) cipher.decrypt(file.readBytes()) else null
    }

    fun delete(id: String) {
        if (ID.matches(id)) File(dir, "$id.bin").delete()
    }

    private companion object {
        val ID = Regex("^[0-9a-f-]{36}$")
    }
}
