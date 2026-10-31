package org.recitelabs.dadalink.core.security.di

import android.content.Context
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import org.recitelabs.dadalink.core.security.DatabaseKeyProvider
import org.recitelabs.dadalink.core.security.KeystoreCipher
import org.recitelabs.dadalink.core.security.SecretCipher
import java.io.File
import javax.inject.Qualifier
import javax.inject.Singleton

/** Separate Keystore keys per purpose, so one compromised use does not expose the others. */
@Qualifier @Retention(AnnotationRetention.RUNTIME) annotation class SettingsCipher
@Qualifier @Retention(AnnotationRetention.RUNTIME) annotation class DatabaseKeyCipher
@Qualifier @Retention(AnnotationRetention.RUNTIME) annotation class MediaCipher
@Qualifier @Retention(AnnotationRetention.RUNTIME) annotation class QueueCipher

@Module
@InstallIn(SingletonComponent::class)
object SecurityModule {
    @Provides @Singleton @SettingsCipher
    fun settingsCipher(): SecretCipher = KeystoreCipher("dadalink.settings.v1")

    @Provides @Singleton @DatabaseKeyCipher
    fun databaseKeyCipher(): SecretCipher = KeystoreCipher("dadalink.dbkey.v1")

    @Provides @Singleton @MediaCipher
    fun mediaCipher(): SecretCipher = KeystoreCipher("dadalink.media.v1")

    @Provides @Singleton @QueueCipher
    fun queueCipher(): SecretCipher = KeystoreCipher("dadalink.queue.v1")

    @Provides @Singleton
    fun databaseKeyProvider(
        @ApplicationContext context: Context,
        @DatabaseKeyCipher cipher: SecretCipher,
    ): DatabaseKeyProvider = DatabaseKeyProvider(cipher, File(context.noBackupFilesDir, "keys/db.key"))
}
