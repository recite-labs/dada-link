package org.recitelabs.dadalink.core.domain.repository

import org.recitelabs.dadalink.core.model.AgencyCheckResult

/** Looks a recruitment agency up in the official licence registry. */
interface AgencyRepository {
    suspend fun check(query: String): AgencyCheckResult
}
