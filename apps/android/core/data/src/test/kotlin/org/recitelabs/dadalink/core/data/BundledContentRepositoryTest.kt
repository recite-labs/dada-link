package org.recitelabs.dadalink.core.data

import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.content.ContentBundleDataSource
import org.recitelabs.dadalink.core.data.repository.BundledContentRepository
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpContactKind
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class BundledContentRepositoryTest {
    @Test fun `reads the bundled directory in amharic with english fallback`() = runTest {
        val repo = BundledContentRepository(ContentBundleDataSource(ApplicationProvider.getApplicationContext(), StandardTestDispatcher(testScheduler)))

        val directory = repo.helpDirectory(Country.SAUDI_ARABIA, AppLanguage.AMHARIC)
        assertNotNull(directory)
        directory!!

        assertEquals("911", directory.emergency.phone)
        assertEquals("በሪያድ የኢትዮጵያ ኤምባሲ", directory.embassy?.name)
        assertEquals(HelpContactKind.EMBASSY, directory.sections.first { it.group == HelpContactKind.EMBASSY }.contacts.first().kind)
        val rights = repo.articles(ArticleCategory.RIGHTS, Country.SAUDI_ARABIA, AppLanguage.OROMO)
        assertTrue(rights.isNotEmpty())
        assertEquals("rights-sa", rights.first().id)
        assertTrue("reviewed content must not show the draft badge", rights.none { it.isDraft })
        assertEquals(7, repo.countriesWithDirectory().size)
    }

    @Test fun `articles follow the same categories and countries as synced content`() = runTest {
        val repo = BundledContentRepository(ContentBundleDataSource(ApplicationProvider.getApplicationContext(), StandardTestDispatcher(testScheduler)))

        val saRights = repo.articles(ArticleCategory.RIGHTS, Country.SAUDI_ARABIA, AppLanguage.ENGLISH).map { it.id }
        assertTrue("rights-sa" in saRights && "passport-taken" in saRights)
        assertTrue("other countries' rights are hidden", "rights-ae" !in saRights)
        val health = repo.articles(ArticleCategory.HEALTH, null, AppLanguage.AMHARIC)
        assertTrue("pregnancy-abroad" in health.map { it.id })
        assertTrue(health.all { it.category == ArticleCategory.HEALTH && !it.isDraft })
        assertTrue(repo.articles(ArticleCategory.BEFORE_YOU_GO, null, AppLanguage.ENGLISH).isNotEmpty())
        assertTrue(repo.articles(ArticleCategory.RETURN, Country.ETHIOPIA, AppLanguage.OROMO).isNotEmpty())
        val article = repo.article("passport-taken", AppLanguage.OROMO)!!
        assertFalse(article.isDraft)
        assertTrue(article.body.isNotBlank())
    }
}
