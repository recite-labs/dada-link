package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import org.recitelabs.dadalink.core.network.model.SosRelayRequestDto
import javax.inject.Inject

interface SosApi {
    /** @throws java.io.IOException when offline or the server rejects the relay. */
    suspend fun relay(request: SosRelayRequestDto)
}

/** `POST {base}/v1/safety/sos` — transient relay, the server stores nothing (provisional path). */
class KtorSosApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
) : SosApi {
    override suspend fun relay(request: SosRelayRequestDto) {
        val response = client.post(baseUrl.resolve("v1/safety/sos")) {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        if (!response.status.isSuccess()) throw ApiException(response.status.value, "SOS relay failed: ${response.status}")
    }
}
