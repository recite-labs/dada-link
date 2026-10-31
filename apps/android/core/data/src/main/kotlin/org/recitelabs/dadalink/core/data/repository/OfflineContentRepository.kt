package org.recitelabs.dadalink.core.data.repository

import org.recitelabs.dadalink.core.content.ArticleDto
import org.recitelabs.dadalink.core.content.ContactDto
import org.recitelabs.dadalink.core.content.ContentBundleDataSource
import org.recitelabs.dadalink.core.content.pick
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AgencyStatus
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpContact
import org.recitelabs.dadalink.core.model.HelpDirectory
import org.recitelabs.dadalink.core.model.HelpSection
import javax.inject.Inject

class OfflineContentRepository @Inject constructor(private val source: ContentBundleDataSource) : ContentRepository {

    override suspend fun helpDirectory(country: Country, language: AppLanguage): HelpDirectory? {
        val dir = source.bundle().directories.firstOrNull { it.country == country.isoCode } ?: return null
        val lang = language.tag
        return HelpDirectory(
            country = country,
            emergency = dir.emergency.toModel(lang),
            sections = dir.sections.map { s -> HelpSection(s.title.pick(lang), s.contacts.map { it.toModel(lang) }) },
            lastReviewed = dir.lastReviewed,
        )
    }

    override suspend fun countriesWithDirectory(): List<Country> =
        source.bundle().directories.mapNotNull { Country.fromIso(it.country) }

    override suspend fun articles(category: ArticleCategory, country: Country?, language: AppLanguage): List<Article> =
        source.bundle().articles
            .filter { it.category.toCategory() == category }
            .filter { country == null || it.country == null || it.country == country.isoCode }
            .map { it.toModel(language.tag) }

    override suspend fun article(id: String, language: AppLanguage): Article? =
        source.bundle().articles.firstOrNull { it.id == id }?.toModel(language.tag)

    override suspend fun licensedAgencies(): List<Agency> = source.bundle().agencies.map {
        Agency(
            name = it.name,
            licenceNumber = it.licence,
            status = when (it.status) {
                "suspended" -> AgencyStatus.SUSPENDED
                "revoked" -> AgencyStatus.REVOKED
                else -> AgencyStatus.LICENSED
            },
            city = it.city,
        )
    }

    private fun ContactDto.toModel(lang: String) = HelpContact(
        id = id,
        name = name.pick(lang),
        description = description.pick(lang),
        phone = phone,
        hours = hours,
        verified = verified,
    )

    private fun ArticleDto.toModel(lang: String) = Article(
        id = id,
        category = category.toCategory() ?: ArticleCategory.RIGHTS,
        country = Country.fromIso(country),
        title = title.pick(lang),
        summary = summary.pick(lang),
        body = body.pick(lang),
        reviewedBy = reviewedBy,
        isDraft = status != "reviewed",
    )

    private fun String.toCategory(): ArticleCategory? = when (this) {
        "rights" -> ArticleCategory.RIGHTS
        "health" -> ArticleCategory.HEALTH
        "before_you_go" -> ArticleCategory.BEFORE_YOU_GO
        "return" -> ArticleCategory.RETURN
        else -> null
    }
}
