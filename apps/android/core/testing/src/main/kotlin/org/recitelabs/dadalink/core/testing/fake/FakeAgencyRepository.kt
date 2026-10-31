package org.recitelabs.dadalink.core.testing.fake

import org.recitelabs.dadalink.core.domain.repository.AgencyRepository
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.testing.TestData

/** Answers [results] by exact query; anything else is NotFound. */
class FakeAgencyRepository(
    var results: Map<String, AgencyCheckResult> = mapOf(
        "MoLS/123/2024" to AgencyCheckResult.Found(TestData.licensedAgency),
        "Selam employment" to AgencyCheckResult.Found(TestData.licensedAgency),
    ),
) : AgencyRepository {
    val queries = mutableListOf<String>()

    override suspend fun check(query: String): AgencyCheckResult {
        queries += query
        return results[query] ?: AgencyCheckResult.NotFound
    }
}
