package org.recitelabs.dadalink.core.domain.repository

import kotlinx.coroutines.flow.Flow
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpDirectory

/**
 * Reviewed content that must work offline: help numbers, articles, licensed agencies.
 * Synced from the backend into an on-device store; the bundled sample is only a first-launch fallback.
 * Implementations must never throw for help numbers: fall back to the bundle instead.
 */
interface ContentRepository {
    suspend fun helpDirectory(country: Country, language: AppLanguage): HelpDirectory?

    /** Like [helpDirectory], re-emitting when a sync stores newer numbers. */
    fun observeHelpDirectory(country: Country, language: AppLanguage): Flow<HelpDirectory?>
    suspend fun countriesWithDirectory(): List<Country>
    suspend fun articles(category: ArticleCategory, country: Country?, language: AppLanguage): List<Article>
    suspend fun article(id: String, language: AppLanguage): Article?
    /** Bundled sample list, used only by the offline/fake agency check. */
    suspend fun licensedAgencies(): List<Agency>
}
