package org.recitelabs.dadalink.core.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import app.cash.turbine.test
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.content.ContentBundleDataSource
import org.recitelabs.dadalink.core.data.repository.BundledContentRepository
import org.recitelabs.dadalink.core.data.repository.OfflineFirstContentRepository
import org.recitelabs.dadalink.core.data.sync.ContentSyncer
import org.recitelabs.dadalink.core.database.DadaDatabase
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.network.ApiException
import org.robolectric.RobolectricTestRunner
import java.io.IOException
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

/** Syncer + offline-first repository on an in-memory database and the real bundled sample. */
@RunWith(RobolectricTestRunner::class)
class ContentSyncTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()
    private val db = Room.inMemoryDatabaseBuilder(context, DadaDatabase::class.java).allowMainThreadQueries().build()
    private val api = FakeContentApi(
        directories = mapOf("SA" to Dtos.saudi, "ET" to listOf(Dtos.entry("et-police", "police", shortCode = "991", emergency = true, country = "ET"))),
        items = listOf(
            Dtos.content("rights-sa", kind = "rights", phase = null),
            Dtos.content("leaving-safely", countries = listOf("SA", "AE")),
            Dtos.content("rights-lb", kind = "rights", phase = null, countries = listOf("LB")),
            Dtos.content("coming-home", phase = "return", countries = listOf("ET")),
        ),
    )
    private var now = Instant.parse("2026-10-31T10:00:00Z")
    private val clock = object : Clock() {
        override fun getZone() = ZoneOffset.UTC
        override fun withZone(zone: java.time.ZoneId?) = this
        override fun instant() = now
    }

    @After fun close() = db.close()

    private fun TestScope.parts(database: () -> DadaDatabase = { db }): Pair<ContentSyncer, OfflineFirstContentRepository> {
        val io = StandardTestDispatcher(testScheduler)
        val bundled = BundledContentRepository(ContentBundleDataSource(context, io))
        return ContentSyncer(api, { database() }, clock, io) to OfflineFirstContentRepository({ database() }, bundled, io)
    }

    @Test fun `before the first sync the bundled sample answers`() = runTest {
        val (_, repo) = parts()
        val directory = repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)!!
        assertEquals("911", directory.emergency.phone)
        assertEquals(7, repo.countriesWithDirectory().size)
        assertTrue(repo.articles(ArticleCategory.HEALTH, null, AppLanguage.ENGLISH).isNotEmpty())
    }

    @Test fun `sync stores directories and content, then reads come from the store`() = runTest {
        val (syncer, repo) = parts()
        assertTrue(syncer.isStale(Country.SAUDI_ARABIA, AppLanguage.ENGLISH))

        syncer.sync(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)

        assertEquals(listOf("directory:SA", "directory:ET", "list:en"), api.calls.take(3))
        val directory = repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)!!
        assertEquals("sa-unified-emergency", directory.emergency.id)
        assertEquals("991", repo.helpDirectory(Country.ETHIOPIA, AppLanguage.ENGLISH)!!.emergency.phone)
        val rights = repo.articles(ArticleCategory.RIGHTS, Country.SAUDI_ARABIA, AppLanguage.ENGLISH).map { it.id }
        assertEquals(listOf("rights-sa", "leaving-safely"), rights)
        assertEquals(listOf("coming-home"), repo.articles(ArticleCategory.RETURN, null, AppLanguage.ENGLISH).map { it.id })
        assertEquals("## Body rights-sa", repo.article("rights-sa", AppLanguage.ENGLISH)!!.body)
        assertFalse(syncer.isStale(Country.SAUDI_ARABIA, AppLanguage.ENGLISH))
        assertTrue("other language not synced yet", syncer.isStale(Country.SAUDI_ARABIA, AppLanguage.AMHARIC))
        now = now.plusSeconds(13 * 3600)
        assertTrue("older than 12 hours", syncer.isStale(Country.SAUDI_ARABIA, AppLanguage.ENGLISH))
    }

    @Test fun `observed help numbers update when a sync lands`() = runTest {
        val (syncer, repo) = parts()
        repo.observeHelpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH).test {
            assertEquals("2026-10-31", awaitItem()!!.lastReviewed) // bundled content
            syncer.sync(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)
            assertEquals("sa-unified-emergency", awaitItem()!!.emergency.id)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test fun `offline sync fails without touching what is stored`() = runTest {
        val (syncer, repo) = parts()
        syncer.sync(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)
        api.failWith = IOException("offline")

        val error = runCatching { syncer.sync(Country.SAUDI_ARABIA, AppLanguage.ENGLISH) }.exceptionOrNull()

        assertTrue(error is IOException)
        assertEquals("sa-unified-emergency", repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)!!.emergency.id)
        assertEquals(2, repo.articles(ArticleCategory.RIGHTS, Country.SAUDI_ARABIA, AppLanguage.ENGLISH).size)
    }

    @Test fun `help numbers are kept even when the content download fails`() = runTest {
        val (syncer, repo) = parts()
        api.failItemsWith = ApiException.Upstream("d1")

        runCatching { syncer.sync(Country.SAUDI_ARABIA, AppLanguage.ENGLISH) }

        assertEquals("sa-unified-emergency", repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)!!.emergency.id)
        assertTrue("content falls back to the bundle", repo.articles(ArticleCategory.HEALTH, null, AppLanguage.ENGLISH).isNotEmpty())
    }

    @Test fun `if the encrypted database cannot open, help numbers still come from the bundle`() = runTest {
        val (_, repo) = parts { throw IllegalStateException("Keystore unavailable") }
        assertEquals("911", repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH)!!.emergency.phone)
        repo.observeHelpDirectory(Country.SAUDI_ARABIA, AppLanguage.ENGLISH).test {
            assertEquals("911", awaitItem()!!.emergency.phone)
            cancelAndIgnoreRemainingEvents()
        }
    }
}
