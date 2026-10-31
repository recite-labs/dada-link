package org.recitelabs.dadalink.core.domain.repository

import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpDirectory

/**
 * Reviewed content that must work offline: help numbers, articles, licensed agencies.
 * Today backed by a bundled asset; later synced from the content backend.
 */
interface ContentRepository {
    suspend fun helpDirectory(country: Country, language: AppLanguage): HelpDirectory?
    suspend fun countriesWithDirectory(): List<Country>
    suspend fun articles(category: ArticleCategory, country: Country?, language: AppLanguage): List<Article>
    suspend fun article(id: String, language: AppLanguage): Article?
    suspend fun licensedAgencies(): List<Agency>
}
