package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.model.ContentSummaryDto
import org.recitelabs.dadalink.core.network.model.DirectoryEntryDto
import org.recitelabs.dadalink.core.network.model.EmergencyContactDto
import org.recitelabs.dadalink.core.network.model.LocalizedContentDto
import javax.inject.Inject

/** Reviewed content and the help directory. All calls throw [java.io.IOException] (see [ApiException]). */
interface ContentApi {
    /** `GET /content` — summaries (no body), optionally filtered. */
    suspend fun list(
        locale: String? = null,
        country: String? = null,
        phase: String? = null,
        kind: String? = null,
        topic: String? = null,
    ): List<ContentSummaryDto>

    /** `GET /content/{id}` — full text; null on 404. */
    suspend fun item(id: String, locale: String? = null): LocalizedContentDto?

    /** `GET /directory/{country}` — curated order, emergency numbers first. */
    suspend fun directory(country: String): List<DirectoryEntryDto>

    /** `GET /directory/{country}/emergency` — dialable emergency numbers with localised names. */
    suspend fun emergencyContacts(country: String, locale: String? = null): List<EmergencyContactDto>
}

class KtorContentApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
    private val json: Json,
) : ContentApi {

    override suspend fun list(locale: String?, country: String?, phase: String?, kind: String?, topic: String?) =
        client.get(baseUrl.resolve(ApiRoutes.CONTENT)) {
            locale?.let { parameter("locale", it) }
            country?.let { parameter("country", it) }
            phase?.let { parameter("phase", it) }
            kind?.let { parameter("kind", it) }
            topic?.let { parameter("topic", it) }
        }.decodeOrThrow(json, ListSerializer(ContentSummaryDto.serializer()))

    override suspend fun item(id: String, locale: String?): LocalizedContentDto? = try {
        client.get(baseUrl.resolve(ApiRoutes.path(ApiRoutes.CONTENT_ITEM, "id" to id))) {
            locale?.let { parameter("locale", it) }
        }.decodeOrThrow(json, LocalizedContentDto.serializer())
    } catch (_: ApiException.NotFound) {
        null
    }

    override suspend fun directory(country: String) =
        client.get(baseUrl.resolve(ApiRoutes.path(ApiRoutes.DIRECTORY, "country" to country)))
            .decodeOrThrow(json, ListSerializer(DirectoryEntryDto.serializer()))

    override suspend fun emergencyContacts(country: String, locale: String?) =
        client.get(baseUrl.resolve(ApiRoutes.path(ApiRoutes.DIRECTORY_EMERGENCY, "country" to country))) {
            locale?.let { parameter("locale", it) }
        }.decodeOrThrow(json, ListSerializer(EmergencyContactDto.serializer()))
}
