package org.recitelabs.dadalink.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import org.recitelabs.dadalink.core.database.dao.LogEntryDao
import org.recitelabs.dadalink.core.database.model.LogEntryEntity

@Database(entities = [LogEntryEntity::class], version = 1, exportSchema = true)
abstract class DadaDatabase : RoomDatabase() {
    abstract fun logEntryDao(): LogEntryDao
}
