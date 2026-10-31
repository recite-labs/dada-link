package org.recitelabs.dadalink.core.content

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Offline content bundle (assets/content/bundle.json). Text fields are maps from language tag to
 * text; consumers fall back to English. Generated from the reviewed `content/` tree by
 * `pnpm content:android-bundle` (content/scripts/build-android-bundle.mjs); do not edit by hand.
 */
@Serializable
data class ContentBundle(
    val version: Int,
    @SerialName("generated_at") val generatedAt: String,
    val directories: List<DirectoryDto> = emptyList(),
    val articles: List<ArticleDto> = emptyList(),
    val agencies: List<AgencyDto> = emptyList(),
)

typealias LocalizedText = Map<String, String>

@Serializable
data class DirectoryDto(
    val country: String,
    @SerialName("last_reviewed") val lastReviewed: String? = null,
    val emergency: ContactDto,
    val sections: List<SectionDto>,
)

@Serializable
data class SectionDto(
    val title: LocalizedText,
    val contacts: List<ContactDto>,
    /** `HelpContactKind` name; when set the app shows its own localised group title. */
    val group: String? = null,
)

@Serializable
data class ContactDto(
    val id: String,
    /** Directory kind from the content files (`embassy`, `police`, ...), same vocabulary as sync. */
    val kind: String? = null,
    val name: LocalizedText,
    val description: LocalizedText = emptyMap(),
    val phone: String? = null,
    val hours: String? = null,
    val verified: Boolean = false,
    @SerialName("source_url") val sourceUrl: String? = null,
)

@Serializable
data class ArticleDto(
    val id: String,
    /** Primary category (first of [categories]); a value the app does not know hides the item from lists. */
    val category: String,
    /** Every list the item appears in (e.g. an abroad health article is in `health`). */
    val categories: List<String> = emptyList(),
    /** Set when the item applies to exactly one country. */
    val country: String? = null,
    /** Countries the item applies to; empty means all. */
    val countries: List<String> = emptyList(),
    val title: LocalizedText,
    val summary: LocalizedText,
    val body: LocalizedText,
    @SerialName("reviewed_by") val reviewedBy: String? = null,
    /** Status of the English text (`reviewed`, `draft-ai`, `draft`). */
    val status: String = "draft",
    /** Status per language; a language without an entry uses [status]. */
    val statuses: LocalizedText = emptyMap(),
)

@Serializable
data class AgencyDto(
    val name: String,
    val licence: String,
    val status: String,
    val city: String? = null,
    val sample: Boolean = false,
)

/** Picks [language], then English, then anything. */
fun LocalizedText.pick(language: String): String =
    this[language] ?: this["en"] ?: values.firstOrNull().orEmpty()
