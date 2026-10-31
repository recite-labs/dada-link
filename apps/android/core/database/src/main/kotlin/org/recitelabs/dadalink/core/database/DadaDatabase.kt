package org.recitelabs.dadalink.core.database

import androidx.room.AutoMigration
import androidx.room.Database
import androidx.room.RoomDatabase
import org.recitelabs.dadalink.core.database.dao.ContentDao
import org.recitelabs.dadalink.core.database.dao.LogEntryDao
import org.recitelabs.dadalink.core.database.model.ContentEntity
import org.recitelabs.dadalink.core.database.model.DirectoryEntryEntity
import org.recitelabs.dadalink.core.database.model.LogEntryEntity
import org.recitelabs.dadalink.core.database.model.SyncStateEntity

/**
 * One SQLCipher database. Synced content lives here too: which country's numbers are cached says
 * where the user works, so it is encrypted like the private log.
 */
@Database(
    entities = [LogEntryEntity::class, ContentEntity::class, DirectoryEntryEntity::class, SyncStateEntity::class],
    version = 2,
    exportSchema = true,
    autoMigrations = [AutoMigration(from = 1, to = 2)],
)
abstract class DadaDatabase : RoomDatabase() {
    abstract fun logEntryDao(): LogEntryDao
    abstract fun contentDao(): ContentDao
}
