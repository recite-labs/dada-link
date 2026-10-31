package org.recitelabs.dadalink.core.datastore

import androidx.datastore.core.DataStore
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SettingsDataSource @Inject constructor(private val store: DataStore<StoredSettings>) {
    val data: Flow<StoredSettings> = store.data

    suspend fun update(transform: (StoredSettings) -> StoredSettings) {
        store.updateData(transform)
    }
}
