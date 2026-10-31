package org.recitelabs.dadalink.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.database.model.LogEntryEntity

@Dao
interface LogEntryDao {
    @Query("SELECT * FROM log_entries ORDER BY date DESC, id DESC")
    fun observeAll(): Flow<List<LogEntryEntity>>

    @Insert
    suspend fun insert(entry: LogEntryEntity): Long

    @Query("DELETE FROM log_entries WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("SELECT photo_ids FROM log_entries WHERE id = :id")
    suspend fun photoIds(id: Long): String?
}
