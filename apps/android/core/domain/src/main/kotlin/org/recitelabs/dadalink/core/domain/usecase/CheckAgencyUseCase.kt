package org.recitelabs.dadalink.core.domain.usecase

import org.recitelabs.dadalink.core.domain.repository.AgencyRepository
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import javax.inject.Inject

/** Checks an agency's licence by name or licence number. Blank queries are never sent. */
class CheckAgencyUseCase @Inject constructor(private val agencies: AgencyRepository) {
    suspend operator fun invoke(query: String): AgencyCheckResult {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return AgencyCheckResult.NotFound
        return agencies.check(trimmed.take(MAX_QUERY))
    }

    private companion object {
        /** `GET /agencies/check?q=` accepts at most 200 characters. */
        const val MAX_QUERY = 200
    }
}
