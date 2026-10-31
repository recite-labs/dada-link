package org.recitelabs.dadalink.core.content

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.common.DadaDispatchers
import org.recitelabs.dadalink.core.common.Dispatcher
import javax.inject.Inject
import javax.inject.Singleton

/** Loads and caches the bundled content. Works with no network at all. */
@Singleton
class ContentBundleDataSource @Inject constructor(
    @ApplicationContext private val context: Context,
    @Dispatcher(DadaDispatchers.IO) private val io: CoroutineDispatcher,
) {
    private val mutex = Mutex()
    private var cached: ContentBundle? = null

    suspend fun bundle(): ContentBundle = mutex.withLock {
        cached ?: withContext(io) {
            context.assets.open(BUNDLE_PATH).use { parse(it.readBytes().decodeToString()) }
        }.also { cached = it }
    }

    companion object {
        const val BUNDLE_PATH = "content/bundle.json"
        private val json = Json { ignoreUnknownKeys = true }

        fun parse(text: String): ContentBundle = json.decodeFromString(ContentBundle.serializer(), text)
    }
}
