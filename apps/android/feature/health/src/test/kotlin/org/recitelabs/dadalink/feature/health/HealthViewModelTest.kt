package org.recitelabs.dadalink.feature.health

import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeContentRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository

class HealthViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    @Test fun `lists only health articles`() = runTest {
        val health = TestData.rightsArticle.copy(id = "h1", category = ArticleCategory.HEALTH, country = null)
        val vm = HealthViewModel(FakeSettingsRepository(), FakeContentRepository(allArticles = listOf(TestData.rightsArticle, health)))
        vm.articles.test {
            var items = awaitItem()
            if (items.isEmpty()) items = awaitItem()
            assertEquals(listOf("h1"), items.map { it.id })
        }
    }
}
