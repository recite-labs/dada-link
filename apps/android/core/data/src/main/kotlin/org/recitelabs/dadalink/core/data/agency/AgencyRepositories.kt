package org.recitelabs.dadalink.core.data.agency

import kotlinx.coroutines.CancellationException
import org.recitelabs.dadalink.core.domain.repository.AgencyRepository
import org.recitelabs.dadalink.core.domain.repository.ContentRepository
import org.recitelabs.dadalink.core.domain.safety.AgencyMatcher
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.model.AgencyStatus
import org.recitelabs.dadalink.core.network.AgencyApi
import org.recitelabs.dadalink.core.network.ApiException
import java.io.IOException
import javax.inject.Inject

/** `GET /agencies/check`. The registry is online-only: no connection → [AgencyCheckResult.Offline]. */
class RemoteAgencyRepository @Inject constructor(private val api: AgencyApi) : AgencyRepository {
    override suspend fun check(query: String): AgencyCheckResult = try {
        val result = api.check(query)
        val match = result.matches.firstOrNull()
        if (result.verdict == VERDICT_NOT_FOUND || match == null) {
            AgencyCheckResult.NotFound
        } else {
            AgencyCheckResult.Found(Agency(match.name, match.licenceNumber, statusOf(match.status), match.region))
        }
    } catch (e: ApiException.Invalid) {
        AgencyCheckResult.Invalid(e.reason)
    } catch (e: CancellationException) {
        throw e
    } catch (_: IOException) {
        AgencyCheckResult.Offline
    }

    private fun statusOf(wire: String) = when (wire) {
        "licensed" -> AgencyStatus.LICENSED
        "suspended" -> AgencyStatus.SUSPENDED
        "revoked" -> AgencyStatus.REVOKED
        else -> AgencyStatus.UNKNOWN
    }

    private companion object {
        const val VERDICT_NOT_FOUND = "not-found"
    }
}

/** Fake-backend builds: matches against the bundled sample list. */
class BundledAgencyRepository @Inject constructor(private val content: ContentRepository) : AgencyRepository {
    override suspend fun check(query: String): AgencyCheckResult {
        val match = content.licensedAgencies().firstOrNull { AgencyMatcher.matches(query, it.name, it.licenceNumber) }
        return match?.let(AgencyCheckResult::Found) ?: AgencyCheckResult.NotFound
    }
}
