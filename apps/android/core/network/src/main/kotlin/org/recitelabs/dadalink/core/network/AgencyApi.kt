package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.model.AgencyCheckDto
import javax.inject.Inject

interface AgencyApi {
    /** `GET /agencies/check?q=` — throws [ApiException.Invalid] for queries the server rejects (e.g. too short). */
    suspend fun check(query: String): AgencyCheckDto
}

class KtorAgencyApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
    private val json: Json,
) : AgencyApi {
    override suspend fun check(query: String): AgencyCheckDto =
        client.get(baseUrl.resolve(ApiRoutes.AGENCIES_CHECK)) { parameter("q", query) }
            .decodeOrThrow(json, AgencyCheckDto.serializer())
}
