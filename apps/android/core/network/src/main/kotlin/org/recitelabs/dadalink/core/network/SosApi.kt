package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.content.TextContent
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.model.SosRequestDto
import org.recitelabs.dadalink.core.network.model.SosResultDto
import javax.inject.Inject

interface SosApi {
    /**
     * `POST /safety/sos` — transient relay by SMS and/or Telegram; the server stores nothing.
     * Throws [ApiException.Upstream] (503) when no channel succeeded, [ApiException.RateLimited] (429),
     * or a plain [java.io.IOException] when offline.
     */
    suspend fun relay(request: SosRequestDto): SosResultDto
}

class KtorSosApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
    private val json: Json,
) : SosApi {
    override suspend fun relay(request: SosRequestDto): SosResultDto =
        client.post(baseUrl.resolve(ApiRoutes.SAFETY_SOS)) {
            setBody(TextContent(json.encodeToString(SosRequestDto.serializer(), request), ContentType.Application.Json))
        }.decodeOrThrow(json, SosResultDto.serializer())
}
