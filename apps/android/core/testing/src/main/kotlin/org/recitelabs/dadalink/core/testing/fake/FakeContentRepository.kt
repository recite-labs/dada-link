package org.recitelabs.dadalink.core.testing.fake

import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpDirectory
import org.recitelabs.dadalink.core.testing.TestData

class FakeContentRepository(
    var directories: Map<Country, HelpDirectory> = mapOf(Country.SAUDI_ARABIA to TestData.saudiDirectory),
    var allArticles: List<Article> = listOf(TestData.rightsArticle),
    var agencies: List<Agency> = listOf(TestData.licensedAgency),
) : ContentRepository {
    override suspend fun helpDirectory(country: Country, language: AppLanguage) = directories[country]
    override suspend fun countriesWithDirectory() = directories.keys.toList()
    override suspend fun articles(category: ArticleCategory, country: Country?, language: AppLanguage) =
        allArticles.filter { it.category == category && (country == null || it.country == null || it.country == country) }
    override suspend fun article(id: String, language: AppLanguage) = allArticles.firstOrNull { it.id == id }
    override suspend fun licensedAgencies() = agencies
}
