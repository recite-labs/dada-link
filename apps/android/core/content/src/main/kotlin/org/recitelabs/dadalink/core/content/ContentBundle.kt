package org.recitelabs.dadalink.core.content

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Offline content bundle (assets/content/bundle.json). Text fields are maps from language tag to
 * text; consumers fall back to English. The real bundle will be produced by the content track and
 * served by the backend; this file only holds samples.
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
data class SectionDto(val title: LocalizedText, val contacts: List<ContactDto>)

@Serializable
data class ContactDto(
    val id: String,
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
    val category: String,
    val country: String? = null,
    val title: LocalizedText,
    val summary: LocalizedText,
    val body: LocalizedText,
    @SerialName("reviewed_by") val reviewedBy: String? = null,
    val status: String = "draft",
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
