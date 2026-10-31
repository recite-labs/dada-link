package org.recitelabs.dadalink.core.model

/** What kind of service a help contact is (drives grouping and the SOS embassy shortcut). */
enum class HelpContactKind { EMERGENCY, EMBASSY, LABOUR, SUPPORT, HEALTH, LEGAL, RETURNEE, OTHER }

/** A phone line / service in the per-country help directory. */
data class HelpContact(
    val id: String,
    val name: String,
    val description: String,
    /** Dialable number (short code inside the country, else the full number), or null when unknown. */
    val phone: String?,
    val hours: String?,
    val verified: Boolean,
    val kind: HelpContactKind = HelpContactKind.OTHER,
)

/**
 * A group of contacts. [group] is set for synced directories (the UI localises its title);
 * bundled sections carry an already-localised [title].
 */
data class HelpSection(val title: String, val contacts: List<HelpContact>, val group: HelpContactKind? = null)

data class HelpDirectory(
    val country: Country,
    val emergency: HelpContact,
    val sections: List<HelpSection>,
    val lastReviewed: String?,
) {
    /** Embassy line if the directory has one (used by the SOS screens). */
    val embassy: HelpContact?
        get() = sections.flatMap { it.contacts }.let { all ->
            all.firstOrNull { it.kind == HelpContactKind.EMBASSY && it.phone != null }
                ?: all.firstOrNull { it.id.startsWith("embassy") }
        }
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

enum class AgencyStatus { LICENSED, SUSPENDED, REVOKED, UNKNOWN }

data class Agency(val name: String, val licenceNumber: String?, val status: AgencyStatus, val city: String?)

sealed interface AgencyCheckResult {
    data class Found(val agency: Agency) : AgencyCheckResult
    data object NotFound : AgencyCheckResult

    /** The registry is online-only: no connection, so no verdict. */
    data object Offline : AgencyCheckResult

    /** The query was rejected (e.g. too short); [reason] is safe to show. */
    data class Invalid(val reason: String) : AgencyCheckResult
}
