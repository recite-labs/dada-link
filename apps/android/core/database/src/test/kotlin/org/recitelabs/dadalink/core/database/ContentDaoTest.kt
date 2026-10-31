package org.recitelabs.dadalink.core.database

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.database.model.ContentEntity
import org.recitelabs.dadalink.core.database.model.DirectoryEntryEntity
import org.recitelabs.dadalink.core.database.model.SyncStateEntity
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class ContentDaoTest {
    private val db = Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext<Context>(), DadaDatabase::class.java)
        .allowMainThreadQueries()
        .build()
    private val dao = db.contentDao()

    @After fun close() = db.close()

    private fun entry(id: String, country: String = "SA", position: Int = 0) = DirectoryEntryEntity(
        id, country, "police", "Police", "ፖሊስ", null, null, null, null, null, "999", null, "24/7", null,
        emergency = true, verified = false, lastVerified = null, position = position,
    )

    private fun content(id: String, locale: String, position: Int) = ContentEntity(
        id, locale, locale, "article", "abroad", "SA,AE", "wages", "reviewed", "T", "S", "B", sensitive = false, position = position,
    )

    @Test fun `replacing a directory swaps it and keeps curated order`() = runTest {
        dao.replaceDirectory("SA", listOf(entry("old")))
        dao.replaceDirectory("SA", listOf(entry("b", position = 1), entry("a", position = 0)))
        dao.replaceDirectory("ET", listOf(entry("et", country = "ET")))

        assertEquals(listOf("a", "b"), dao.directory("SA").map { it.id })
        assertEquals(setOf("SA", "ET"), dao.directoryCountries().toSet())
    }

    @Test fun `an empty response never wipes stored numbers`() = runTest {
        dao.replaceDirectory("SA", listOf(entry("a")))
        dao.replaceDirectory("SA", emptyList())
        assertEquals(listOf("a"), dao.directory("SA").map { it.id })
    }

    @Test fun `directory flow re-emits after a sync`() = runTest {
        dao.observeDirectory("SA").test {
            assertEquals(emptyList<DirectoryEntryEntity>(), awaitItem())
            dao.replaceDirectory("SA", listOf(entry("a")))
            assertEquals(listOf("a"), awaitItem().map { it.id })
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test fun `content is replaced per locale`() = runTest {
        dao.replaceContent("am", listOf(content("x", "am", 0), content("y", "am", 1)))
        dao.replaceContent("en", listOf(content("x", "en", 0)))
        dao.replaceContent("am", listOf(content("y", "am", 0)))

        assertEquals(listOf("y"), dao.content("am").map { it.id })
        assertEquals(1, dao.contentCount("en"))
        assertNull(dao.contentItem("x", "am"))
    }

    @Test fun `sync state upserts`() = runTest {
        assertNull(dao.syncedAt("directory:SA"))
        dao.markSynced(SyncStateEntity("directory:SA", 1))
        dao.markSynced(SyncStateEntity("directory:SA", 2))
        assertEquals(2L, dao.syncedAt("directory:SA"))
    }
}
