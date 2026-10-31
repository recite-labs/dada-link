package org.recitelabs.dadalink.core.domain.usecase

import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.domain.safety.AgencyMatcher
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import javax.inject.Inject

/** Looks an agency up by licence number or (normalised) name in the licensed list. */
class CheckAgencyUseCase @Inject constructor(private val content: ContentRepository) {
    suspend operator fun invoke(query: String): AgencyCheckResult {
        val match = content.licensedAgencies().firstOrNull { AgencyMatcher.matches(query, it.name, it.licenceNumber) }
        return match?.let(AgencyCheckResult::Found) ?: AgencyCheckResult.NotFound
    }
}
