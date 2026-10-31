package org.recitelabs.dadalink.core.datastore.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.core.DataStoreFactory
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import org.recitelabs.dadalink.core.common.DadaDispatchers
import org.recitelabs.dadalink.core.common.Dispatcher
import org.recitelabs.dadalink.core.datastore.EncryptedJsonSerializer
import org.recitelabs.dadalink.core.datastore.StoredSettings
import org.recitelabs.dadalink.core.security.SecretCipher
import org.recitelabs.dadalink.core.security.di.SettingsCipher
import java.io.File
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataStoreModule {
    @Provides
    @Singleton
    fun settingsStore(
        @ApplicationContext context: Context,
        @SettingsCipher cipher: SecretCipher,
        @Dispatcher(DadaDispatchers.IO) io: CoroutineDispatcher,
    ): DataStore<StoredSettings> = DataStoreFactory.create(
        serializer = EncryptedJsonSerializer(cipher, StoredSettings.serializer(), StoredSettings()),
        // If the Keystore key is gone (e.g. device restore), start fresh rather than crash.
        corruptionHandler = ReplaceFileCorruptionHandler { StoredSettings() },
        scope = CoroutineScope(io + SupervisorJob()),
        // noBackupFilesDir: never part of any backup.
        produceFile = { File(context.noBackupFilesDir, "settings.enc") },
    )
}
