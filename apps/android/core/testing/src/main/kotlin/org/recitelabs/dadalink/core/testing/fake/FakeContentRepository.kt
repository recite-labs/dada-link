package org.recitelabs.dadalink.core.testing.fake

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpDirectory
import org.recitelabs.dadalink.core.testing.TestData

class FakeContentRepository(
    directories: Map<Country, HelpDirectory> = mapOf(Country.SAUDI_ARABIA to TestData.saudiDirectory),
    var allArticles: List<Article> = listOf(TestData.rightsArticle),
    var agencies: List<Agency> = listOf(TestData.licensedAgency),
) : ContentRepository {
    /** Setting this emits to [observeHelpDirectory] collectors, like a finished sync. */
    private val state = MutableStateFlow(directories)
    var directories: Map<Country, HelpDirectory>
        get() = state.value
        set(value) {
            state.value = value
        }

    override suspend fun helpDirectory(country: Country, language: AppLanguage) = directories[country]
    override fun observeHelpDirectory(country: Country, language: AppLanguage): Flow<HelpDirectory?> = state.map { it[country] }
    override suspend fun countriesWithDirectory() = directories.keys.toList()
    override suspend fun articles(category: ArticleCategory, country: Country?, language: AppLanguage) =
        allArticles.filter { it.category == category && (country == null || it.country == null || it.country == country) }
    override suspend fun article(id: String, language: AppLanguage) = allArticles.firstOrNull { it.id == id }
    override suspend fun licensedAgencies() = agencies
}
