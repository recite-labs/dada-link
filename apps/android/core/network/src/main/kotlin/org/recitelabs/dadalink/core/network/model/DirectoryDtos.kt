package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.Serializable

/** `DirectoryEntryEncoded` — item of `GET /directory/{country}`. */
@Serializable
data class DirectoryEntryDto(
    val id: String,
    val country: String,
    val kind: String,
    val name: String,
    val names: LocalizedNamesDto? = null,
    val phone: String?,
    val shortCode: String? = null,
    val whatsapp: String? = null,
    val telegram: String? = null,
    val email: String? = null,
    val url: String? = null,
    val city: String? = null,
    val address: String? = null,
    val hours: String? = null,
    val notes: String? = null,
    val helpsWith: List<String> = emptyList(),
    val languages: List<String> = emptyList(),
    val emergency: Boolean,
    val sourceUrl: String,
    val verified: Boolean,
    val lastVerified: String? = null,
)

/** `LocalizedNames` — translated display names keyed by locale. */
@Serializable
data class LocalizedNamesDto(
    val am: String? = null,
    val om: String? = null,
    val en: String? = null,
    val sw: String? = null,
    val ti: String? = null,
)

/** `EmergencyContactEncoded` — item of `GET /directory/{country}/emergency` and of an emergency notice. */
@Serializable
data class EmergencyContactDto(
    val name: String,
    val kind: String,
    val phone: String,
)
