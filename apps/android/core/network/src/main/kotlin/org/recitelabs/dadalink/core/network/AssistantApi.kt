package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.accept
import io.ktor.client.request.post
import io.ktor.client.request.preparePost
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsChannel
import io.ktor.http.ContentType
import io.ktor.http.content.TextContent
import io.ktor.utils.io.readUTF8Line
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.recitelabs.dadalink.core.network.model.AskRequestDto
import org.recitelabs.dadalink.core.network.model.AskResponseDto
import org.recitelabs.dadalink.core.network.model.AssistantFeedbackDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto
import org.recitelabs.dadalink.core.network.model.UpstreamUnavailableDto
import org.recitelabs.dadalink.core.network.sse.SseEvent
import org.recitelabs.dadalink.core.network.sse.SseParser
import javax.inject.Inject

interface AssistantApi {
    /** `POST /assistant/ask` — whole answer at once. */
    suspend fun ask(request: AskRequestDto): AskResponseDto

    /**
     * `POST /assistant/ask/stream` — server-sent events, completed by `Done` (not re-emitted).
     * Fails with [ApiException.RateLimited] (429), [ApiException.Upstream] (failure event) or an
     * offline [java.io.IOException].
     */
    fun stream(request: AskRequestDto): Flow<AssistantStreamEventDto>

    /** `POST /assistant/feedback` — 204. */
    suspend fun feedback(feedback: AssistantFeedbackDto)
}

class KtorAssistantApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
    private val json: Json,
) : AssistantApi {

    override suspend fun ask(request: AskRequestDto): AskResponseDto =
        client.post(baseUrl.resolve(ApiRoutes.ASSISTANT_ASK)) { setBody(jsonBody(request)) }
            .decodeOrThrow(json, AskResponseDto.serializer())

    override fun stream(request: AskRequestDto): Flow<AssistantStreamEventDto> = flow {
        client.preparePost(baseUrl.resolve(ApiRoutes.ASSISTANT_ASK_STREAM)) {
            accept(ContentType.Text.EventStream)
            setBody(jsonBody(request))
        }.execute { response ->
            response.throwIfError(json)
            val channel = response.bodyAsChannel()
            val parser = SseParser()
            while (true) {
                val line = channel.readUTF8Line() ?: break
                val event = parser.feed(line) ?: continue
                when (val parsed = parse(event)) {
                    null -> Unit
                    is AssistantStreamEventDto.Done -> return@execute
                    else -> emit(parsed)
                }
            }
            when (val last = parser.finish()?.let(::parse)) {
                null, is AssistantStreamEventDto.Done -> Unit
                else -> emit(last)
            }
        }
    }

    override suspend fun feedback(feedback: AssistantFeedbackDto) {
        client.post(baseUrl.resolve(ApiRoutes.ASSISTANT_FEEDBACK)) {
            setBody(TextContent(json.encodeToString(AssistantFeedbackDto.serializer(), feedback), ContentType.Application.Json))
        }.throwIfError(json)
    }

    private fun jsonBody(request: AskRequestDto) =
        TextContent(json.encodeToString(AskRequestDto.serializer(), request), ContentType.Application.Json)

    /**
     * Effect's `StreamSse` sends each event as a bare `data:` line holding the event JSON. A failed
     * stream ends with an event named [FAILURE_EVENT]. Unknown `_tag`s are skipped (forward compatible).
     */
    private fun parse(event: SseEvent): AssistantStreamEventDto? {
        if (event.event == FAILURE_EVENT) {
            val service = runCatching { json.decodeFromString(UpstreamUnavailableDto.serializer(), event.data).service }.getOrNull()
            throw ApiException.Upstream(service)
        }
        if (event.data.isBlank()) return null
        return try {
            val obj: JsonObject = json.parseToJsonElement(event.data).jsonObject
            when (obj["_tag"]?.jsonPrimitive?.content) {
                AssistantStreamEventDto.Delta.TAG -> json.decodeFromJsonElement(AssistantStreamEventDto.Delta.serializer(), obj)
                AssistantStreamEventDto.Citations.TAG -> json.decodeFromJsonElement(AssistantStreamEventDto.Citations.serializer(), obj)
                AssistantStreamEventDto.Emergency.TAG -> json.decodeFromJsonElement(AssistantStreamEventDto.Emergency.serializer(), obj)
                AssistantStreamEventDto.Done.TAG -> AssistantStreamEventDto.Done()
                else -> null
            }
        } catch (e: SerializationException) {
            throw ApiException.Malformed(e)
        } catch (e: IllegalArgumentException) {
            throw ApiException.Malformed(e)
        }
    }

    companion object {
        /** `x-effect-stream.failureEvent` in openapi.json. */
        const val FAILURE_EVENT = "effect/http-api/stream/failure"
    }
}
