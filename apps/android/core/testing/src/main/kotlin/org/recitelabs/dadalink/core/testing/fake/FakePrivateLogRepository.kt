package org.recitelabs.dadalink.core.testing.fake

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import org.recitelabs.dadalink.core.domain.repository.PrivateLogRepository
import org.recitelabs.dadalink.core.model.LogEntry

class FakePrivateLogRepository(initial: List<LogEntry> = emptyList()) : PrivateLogRepository {
    private val state = MutableStateFlow(initial)
    private val photos = mutableMapOf<String, ByteArray>()
    private var nextId = (initial.maxOfOrNull { it.id } ?: 0) + 1

    override val entries: Flow<List<LogEntry>> = state

    override suspend fun add(entry: LogEntry): Long {
        val id = nextId++
        val stored = when (entry) {
            is LogEntry.Wage -> entry.copy(id = id)
            is LogEntry.Hours -> entry.copy(id = id)
            is LogEntry.Incident -> entry.copy(id = id)
        }
        state.update { (listOf(stored) + it).sortedByDescending(LogEntry::date) }
        return id
    }

    override suspend fun delete(id: Long) = state.update { list -> list.filterNot { it.id == id } }

    override suspend fun storePhoto(bytes: ByteArray): String = "photo-${photos.size + 1}".also { photos[it] = bytes }

    override suspend fun loadPhoto(photoId: String): ByteArray? = photos[photoId]
}
