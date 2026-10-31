package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.Serializable

/** `ContentSummaryEncoded` — item of `GET /content`. */
@Serializable
data class ContentSummaryDto(
    val id: String,
    val kind: String,
    val phase: String?,
    val countries: List<String>,
    val topics: List<String>,
    val locale: String,
    val status: String,
    val title: String,
    val summary: String,
    val sensitive: Boolean,
)

/** `LocalizedContentEncoded` — `GET /content/{id}`. [locale] may differ from [requestedLocale] (fallback). */
@Serializable
data class LocalizedContentDto(
    val id: String,
    val kind: String,
    val phase: String?,
    val countries: List<String>,
    val topics: List<String>,
    val sources: List<SourceDto>,
    val locale: String,
    val requestedLocale: String,
    val status: String,
    val title: String,
    val summary: String,
    val body: String,
    val availableLocales: List<String>,
    val sensitive: Boolean,
    val related: List<String>,
)

/** `SourceEncoded`. */
@Serializable
data class SourceDto(
    val title: String,
    val url: String,
    val publisher: String? = null,
    val accessed: String? = null,
)

/** Wire literals of `ContentKind` and `ReviewStatus`. */
object ContentWire {
    const val KIND_ARTICLE = "article"
    const val KIND_RIGHTS = "rights"
    const val KIND_FAQ = "faq"
    const val STATUS_REVIEWED = "reviewed"
}
