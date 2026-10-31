package org.recitelabs.dadalink.core.domain.repository

import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.model.LogEntry

/** Device-only encrypted log of wages, hours and incidents. */
interface PrivateLogRepository {
    val entries: Flow<List<LogEntry>>

    suspend fun add(entry: LogEntry): Long
    suspend fun delete(id: Long)

    /** Encrypts and stores a photo; returns an opaque id to attach to an entry. */
    suspend fun storePhoto(bytes: ByteArray): String
    suspend fun loadPhoto(photoId: String): ByteArray?
}
