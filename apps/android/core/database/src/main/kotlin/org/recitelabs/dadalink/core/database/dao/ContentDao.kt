package org.recitelabs.dadalink.core.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.database.model.ContentEntity
import org.recitelabs.dadalink.core.database.model.DirectoryEntryEntity
import org.recitelabs.dadalink.core.database.model.SyncStateEntity

@Dao
interface ContentDao {
    @Query("SELECT * FROM content WHERE locale = :locale ORDER BY position")
    suspend fun content(locale: String): List<ContentEntity>

    @Query("SELECT * FROM content WHERE id = :id AND locale = :locale")
    suspend fun contentItem(id: String, locale: String): ContentEntity?

    @Query("SELECT COUNT(*) FROM content WHERE locale = :locale")
    suspend fun contentCount(locale: String): Int

    @Query("DELETE FROM content WHERE locale = :locale")
    suspend fun deleteContent(locale: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContent(items: List<ContentEntity>)

    /** Atomically swaps a locale's content: readers see the old set or the new one, never a mix. */
    @Transaction
    suspend fun replaceContent(locale: String, items: List<ContentEntity>) {
        deleteContent(locale)
        insertContent(items)
    }

    @Query("SELECT * FROM directory_entries WHERE country = :country ORDER BY position")
    suspend fun directory(country: String): List<DirectoryEntryEntity>

    @Query("SELECT * FROM directory_entries WHERE country = :country ORDER BY position")
    fun observeDirectory(country: String): Flow<List<DirectoryEntryEntity>>

    @Query("SELECT DISTINCT country FROM directory_entries")
    suspend fun directoryCountries(): List<String>

    @Query("DELETE FROM directory_entries WHERE country = :country")
    suspend fun deleteDirectory(country: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDirectory(entries: List<DirectoryEntryEntity>)

    /** Atomically swaps a country's directory. An empty response never wipes stored numbers. */
    @Transaction
    suspend fun replaceDirectory(country: String, entries: List<DirectoryEntryEntity>) {
        if (entries.isEmpty()) return
        deleteDirectory(country)
        insertDirectory(entries)
    }

    @Query("SELECT synced_at FROM sync_state WHERE scope = :scope")
    suspend fun syncedAt(scope: String): Long?

    @Upsert
    suspend fun markSynced(state: SyncStateEntity)
}
