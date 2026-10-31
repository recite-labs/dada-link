package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.model.HealthStatusDto
import javax.inject.Inject

interface HealthApi {
    /** `GET /health`. */
    suspend fun health(): HealthStatusDto
}

class KtorHealthApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
    private val json: Json,
) : HealthApi {
    override suspend fun health(): HealthStatusDto =
        client.get(baseUrl.resolve(ApiRoutes.HEALTH)).decodeOrThrow(json, HealthStatusDto.serializer())
}
