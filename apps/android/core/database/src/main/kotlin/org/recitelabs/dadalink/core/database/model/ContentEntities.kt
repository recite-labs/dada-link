package org.recitelabs.dadalink.core.database.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Synced article/rights/FAQ text, one row per (id, requested locale). [contentLocale] is the
 * language the text is actually in (the server falls back to English when a translation is missing).
 * List columns are comma-separated wire literals (ids, ISO codes and topics never contain commas).
 */
@Entity(tableName = "content", primaryKeys = ["id", "locale"], indices = [Index("locale")])
data class ContentEntity(
    val id: String,
    val locale: String,
    @ColumnInfo(name = "content_locale") val contentLocale: String,
    val kind: String,
    val phase: String?,
    val countries: String,
    val topics: String,
    val status: String,
    val title: String,
    val summary: String,
    val body: String,
    val sensitive: Boolean,
    /** Position in the server's list, to keep its curated order. */
    val position: Int,
)

/** One help directory entry (curated order kept in [position]). */
@Entity(tableName = "directory_entries", indices = [Index("country")])
data class DirectoryEntryEntity(
    @PrimaryKey val id: String,
    val country: String,
    val kind: String,
    val name: String,
    @ColumnInfo(name = "name_am") val nameAm: String?,
    @ColumnInfo(name = "name_om") val nameOm: String?,
    @ColumnInfo(name = "name_en") val nameEn: String?,
    @ColumnInfo(name = "name_sw") val nameSw: String?,
    @ColumnInfo(name = "name_ti") val nameTi: String?,
    val phone: String?,
    @ColumnInfo(name = "short_code") val shortCode: String?,
    val city: String?,
    val hours: String?,
    val notes: String?,
    val emergency: Boolean,
    val verified: Boolean,
    @ColumnInfo(name = "last_verified") val lastVerified: String?,
    val position: Int,
)

/** When a sync scope (e.g. `directory:SA`, `content:am`) last succeeded. */
@Entity(tableName = "sync_state", primaryKeys = ["scope"])
data class SyncStateEntity(
    val scope: String,
    @ColumnInfo(name = "synced_at") val syncedAtEpochMillis: Long,
)
