package org.recitelabs.dadalink.core.data.repository

import dagger.Lazy
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import org.recitelabs.dadalink.core.common.DadaDispatchers
import org.recitelabs.dadalink.core.common.Dispatcher
import org.recitelabs.dadalink.core.database.DadaDatabase
import org.recitelabs.dadalink.core.database.model.asEntity
import org.recitelabs.dadalink.core.database.model.asExternalModel
import org.recitelabs.dadalink.core.domain.repository.PrivateLogRepository
import org.recitelabs.dadalink.core.model.LogEntry
import javax.inject.Inject

/** The database is opened lazily on the IO dispatcher (its key is unwrapped via the Keystore). */
class RoomPrivateLogRepository @Inject constructor(
    private val database: Lazy<DadaDatabase>,
    private val media: EncryptedMediaStore,
    @Dispatcher(DadaDispatchers.IO) private val io: CoroutineDispatcher,
) : PrivateLogRepository {

    private suspend fun dao() = withContext(io) { database.get().logEntryDao() }

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    override val entries: Flow<List<LogEntry>> = flow { emit(dao()) }
        .flatMapLatest { it.observeAll() }
        .map { list -> list.map { it.asExternalModel() } }
        .flowOn(io)

    override suspend fun add(entry: LogEntry): Long = dao().insert(entry.asEntity())

    override suspend fun delete(id: Long) {
        val dao = dao()
        val photos = dao.photoIds(id).orEmpty().split(',').filter(String::isNotBlank)
        dao.delete(id)
        withContext(io) { photos.forEach(media::delete) }
    }

    override suspend fun storePhoto(bytes: ByteArray): String = withContext(io) { media.put(bytes) }

    override suspend fun loadPhoto(photoId: String): ByteArray? = withContext(io) { media.get(photoId) }
}
