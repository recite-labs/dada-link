package org.recitelabs.dadalink.core.model

/** A phone line / service in the per-country help directory. */
data class HelpContact(
    val id: String,
    val name: String,
    val description: String,
    /** Dialable number, or null when not yet verified (shown as "number coming soon"). */
    val phone: String?,
    val hours: String?,
    val verified: Boolean,
)

data class HelpSection(val title: String, val contacts: List<HelpContact>)

data class HelpDirectory(
    val country: Country,
    val emergency: HelpContact,
    val sections: List<HelpSection>,
    val lastReviewed: String?,
) {
    /** Embassy line if the directory has one (used by the SOS screens). */
    val embassy: HelpContact?
        get() = sections.flatMap { it.contacts }.firstOrNull { it.id.startsWith("embassy") }
}

enum class ArticleCategory { RIGHTS, HEALTH, BEFORE_YOU_GO, RETURN }

data class Article(
    val id: String,
    val category: ArticleCategory,
    val country: Country?,
    val title: String,
    val summary: String,
    val body: String,
    val reviewedBy: String?,
    /** True while the text is an unreviewed draft. */
    val isDraft: Boolean,
)

enum class AgencyStatus { LICENSED, SUSPENDED, REVOKED }

data class Agency(val name: String, val licenceNumber: String, val status: AgencyStatus, val city: String?)

sealed interface AgencyCheckResult {
    data class Found(val agency: Agency) : AgencyCheckResult
    data object NotFound : AgencyCheckResult
}
