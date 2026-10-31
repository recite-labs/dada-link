package org.recitelabs.dadalink.core.data

import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.content.ContentBundleDataSource
import org.recitelabs.dadalink.core.data.repository.OfflineContentRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class OfflineContentRepositoryTest {
    @Test fun `reads the bundled directory in amharic with english fallback`() = runTest {
        val repo = OfflineContentRepository(ContentBundleDataSource(ApplicationProvider.getApplicationContext(), StandardTestDispatcher(testScheduler)))

        val directory = repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.AMHARIC)
        assertNotNull(directory)
        directory!!

        assertEquals("911", directory.emergency.phone)
        assertEquals("የኢትዮጵያ ኤምባሲ፣ ሪያድ", directory.embassy?.name)
        val rights = repo.articles(ArticleCategory.RIGHTS, Country.SAUDI_ARABIA, AppLanguage.OROMO)
        assertTrue(rights.isNotEmpty())
        assertTrue(rights.all { it.isDraft })
        assertEquals(7, repo.countriesWithDirectory().size)
    }
}
