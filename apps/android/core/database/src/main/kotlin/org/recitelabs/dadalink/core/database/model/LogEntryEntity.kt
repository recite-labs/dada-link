package org.recitelabs.dadalink.core.database.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import org.recitelabs.dadalink.core.model.LogEntry
import java.time.LocalDate

/** Single-table storage for all log entry kinds; nullable columns depend on [kind]. */
@Entity(tableName = "log_entries", indices = [Index("date")])
data class LogEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val kind: String,
    @ColumnInfo(name = "date") val epochDay: Long,
    val note: String,
    val expected: Long? = null,
    val received: Long? = null,
    val currency: String? = null,
    val hours: Double? = null,
    @ColumnInfo(name = "rest_day") val restDay: Boolean? = null,
    /** Comma-separated opaque photo ids. */
    @ColumnInfo(name = "photo_ids") val photoIds: String = "",
) {
    companion object {
        const val KIND_WAGE = "wage"
        const val KIND_HOURS = "hours"
        const val KIND_INCIDENT = "incident"
    }
}

fun LogEntryEntity.asExternalModel(): LogEntry {
    val date = LocalDate.ofEpochDay(epochDay)
    return when (kind) {
        LogEntryEntity.KIND_WAGE -> LogEntry.Wage(id, date, note, expected ?: 0, received ?: 0, currency ?: "")
        LogEntryEntity.KIND_HOURS -> LogEntry.Hours(id, date, note, hours ?: 0.0, restDay ?: false)
        else -> LogEntry.Incident(id, date, note, photoIds.split(',').filter(String::isNotBlank))
    }
}

fun LogEntry.asEntity(): LogEntryEntity = when (this) {
    is LogEntry.Wage -> LogEntryEntity(
        id = id, kind = LogEntryEntity.KIND_WAGE, epochDay = date.toEpochDay(), note = note,
        expected = expected, received = received, currency = currency,
    )
    is LogEntry.Hours -> LogEntryEntity(
        id = id, kind = LogEntryEntity.KIND_HOURS, epochDay = date.toEpochDay(), note = note,
        hours = hoursWorked, restDay = hadRestDay,
    )
    is LogEntry.Incident -> LogEntryEntity(
        id = id, kind = LogEntryEntity.KIND_INCIDENT, epochDay = date.toEpochDay(), note = note,
        photoIds = photoIds.joinToString(","),
    )
}
