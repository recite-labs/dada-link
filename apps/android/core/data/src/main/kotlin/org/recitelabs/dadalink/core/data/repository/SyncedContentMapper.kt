package org.recitelabs.dadalink.core.data.repository

import org.recitelabs.dadalink.core.database.model.ContentEntity
import org.recitelabs.dadalink.core.database.model.DirectoryEntryEntity
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Article
import org.recitelabs.dadalink.core.model.ArticleCategory
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpContact
import org.recitelabs.dadalink.core.model.HelpContactKind
import org.recitelabs.dadalink.core.model.HelpDirectory
import org.recitelabs.dadalink.core.model.HelpSection
import org.recitelabs.dadalink.core.network.model.ContentWire

/** Maps synced rows (wire vocabulary) to the app's content model. Pure, unit-tested. */
internal object SyncedContentMapper {

    /** `DirectoryKind` literal → group shown in Help. Unknown kinds land in OTHER. */
    fun kindOf(wireKind: String): HelpContactKind = when (wireKind) {
        "emergency", "police", "ambulance", "fire" -> HelpContactKind.EMERGENCY
        "embassy", "consulate" -> HelpContactKind.EMBASSY
        "labour-ministry", "labour-hotline" -> HelpContactKind.LABOUR
        "shelter", "ngo", "helpline", "iom", "un-agency" -> HelpContactKind.SUPPORT
        "health", "mental-health" -> HelpContactKind.HEALTH
        "legal-aid" -> HelpContactKind.LEGAL
        "returnee-service" -> HelpContactKind.RETURNEE
        else -> HelpContactKind.OTHER
    }

    /**
     * Builds the Help directory. The first emergency entry with a dialable number (the server keeps
     * the unified number first) becomes the big emergency card; null when there is none, so the
     * caller can fall back to the bundle rather than show a directory without an emergency number.
     */
    fun directory(country: Country, entries: List<DirectoryEntryEntity>, language: AppLanguage): HelpDirectory? {
        val contacts = entries.sortedBy { it.position }.map { it.toContact(language) to it }
        val (emergency, _) = contacts.firstOrNull { (contact, row) -> row.emergency && contact.phone != null } ?: return null
        val sections = contacts.map { it.first }
            .filterNot { it.id == emergency.id }
            .groupBy { it.kind }
            .toSortedMap(compareBy { it.ordinal })
            .map { (kind, list) -> HelpSection(title = "", contacts = list, group = kind) }
        return HelpDirectory(
            country = country,
            emergency = emergency,
            sections = sections,
            lastReviewed = entries.mapNotNull { it.lastVerified }.maxOrNull(),
        )
    }

    private fun DirectoryEntryEntity.toContact(language: AppLanguage): HelpContact {
        val localized = when (language) {
            AppLanguage.AMHARIC -> nameAm
            AppLanguage.OROMO -> nameOm
            AppLanguage.ENGLISH -> nameEn
            AppLanguage.SWAHILI -> nameSw
        }
        // Notes are English-only on the server: show them to English readers, a neutral city otherwise.
        val description = if (language == AppLanguage.ENGLISH) listOfNotNull(city, notes).joinToString(" · ") else city.orEmpty()
        return HelpContact(
            id = id,
            name = localized ?: name,
            description = description,
            phone = shortCode ?: phone,
            hours = hours,
            verified = verified,
            kind = kindOf(kind),
        )
    }

    /** Which app sections an item appears in (one item can be in several, e.g. an abroad health article). */
    fun categoriesOf(item: ContentEntity): Set<ArticleCategory> = buildSet {
        val topics = item.topics.split(',').toSet()
        val health = topics.any { it in HEALTH_TOPICS }
        if (item.kind == ContentWire.KIND_RIGHTS) add(ArticleCategory.RIGHTS)
        if (health) add(ArticleCategory.HEALTH)
        if (item.kind == ContentWire.KIND_FAQ) return@buildSet
        when (item.phase) {
            "before" -> add(ArticleCategory.BEFORE_YOU_GO)
            "return" -> add(ArticleCategory.RETURN)
            "abroad" -> if (!health) add(ArticleCategory.RIGHTS)
        }
    }

    fun appliesTo(item: ContentEntity, country: Country?): Boolean =
        country == null || item.countries.isEmpty() || country.isoCode in item.countries.split(',')

    fun article(item: ContentEntity, category: ArticleCategory = categoriesOf(item).firstOrNull() ?: ArticleCategory.RIGHTS) = Article(
        id = item.id,
        category = category,
        country = item.countries.split(',').filter(String::isNotEmpty).singleOrNull()?.let(Country::fromIso),
        title = item.title,
        summary = item.summary,
        body = item.body,
        reviewedBy = null,
        isDraft = item.status != ContentWire.STATUS_REVIEWED,
    )

    private val HEALTH_TOPICS = setOf("health", "srh", "mental-health")
}
