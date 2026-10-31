package org.recitelabs.dadalink.core.network.model

import kotlinx.serialization.Serializable

/** `AgencyCheckEncoded` — `GET /agencies/check?q=`. [verdict] is an `AgencyVerdict` literal. */
@Serializable
data class AgencyCheckDto(
    val query: String,
    val verdict: String,
    val matches: List<AgencyDto>,
)

/** `AgencyEncoded`. [status] is an `AgencyStatus` literal. */
@Serializable
data class AgencyDto(
    val id: String,
    val name: String,
    val licenceNumber: String?,
    val status: String,
    val region: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val sourceUrl: String,
    val verifiedAt: String? = null,
)
