package org.recitelabs.dadalink.core.database.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import net.zetetic.database.sqlcipher.SupportOpenHelperFactory
import org.recitelabs.dadalink.core.database.DadaDatabase
import org.recitelabs.dadalink.core.security.DatabaseKeyProvider
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    /**
     * SQLCipher-encrypted database. Construction unwraps the key via the Keystore, so inject it as
     * `dagger.Lazy` and first touch it off the main thread.
     */
    @Provides
    @Singleton
    fun database(@ApplicationContext context: Context, keys: DatabaseKeyProvider): DadaDatabase {
        System.loadLibrary("sqlcipher")
        return Room.databaseBuilder(context, DadaDatabase::class.java, "dadalink.db")
            .openHelperFactory(SupportOpenHelperFactory(keys.passphrase()))
            .build()
    }
}
