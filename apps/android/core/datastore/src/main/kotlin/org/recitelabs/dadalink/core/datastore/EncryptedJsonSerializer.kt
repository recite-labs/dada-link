package org.recitelabs.dadalink.core.datastore

import androidx.datastore.core.CorruptionException
import androidx.datastore.core.Serializer
import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.security.SecretCipher
import java.io.InputStream
import java.io.OutputStream
import java.security.GeneralSecurityException

/**
 * DataStore serializer that writes `encrypt(json(value))`. Nothing in the file is readable without
 * the Keystore key, including which language the user picked.
 */
class EncryptedJsonSerializer<T>(
    private val cipher: SecretCipher,
    private val serializer: KSerializer<T>,
    override val defaultValue: T,
) : Serializer<T> {

    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    override suspend fun readFrom(input: InputStream): T {
        val bytes = input.readBytes()
        if (bytes.isEmpty()) return defaultValue
        return try {
            json.decodeFromString(serializer, cipher.decrypt(bytes).decodeToString())
        } catch (e: GeneralSecurityException) {
            throw CorruptionException("Settings could not be decrypted", e)
        } catch (e: SerializationException) {
            throw CorruptionException("Settings could not be parsed", e)
        }
    }

    override suspend fun writeTo(t: T, output: OutputStream) {
        output.write(cipher.encrypt(json.encodeToString(serializer, t).encodeToByteArray()))
    }
}
