package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.request.accept
import io.ktor.client.request.preparePost
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsChannel
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import io.ktor.utils.io.readUTF8Line
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.model.AssistantRequestDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEvent
import org.recitelabs.dadalink.core.network.model.DeltaDto
import org.recitelabs.dadalink.core.network.model.FollowUpsDto
import org.recitelabs.dadalink.core.network.model.SourcesDto
import org.recitelabs.dadalink.core.network.sse.SseEvent
import org.recitelabs.dadalink.core.network.sse.SseParser
import java.io.IOException
import javax.inject.Inject

interface AssistantApi {
    fun stream(request: AssistantRequestDto): Flow<AssistantStreamEvent>
}

class ApiException(val status: Int, message: String) : IOException(message)

/**
 * `POST {base}/v1/assistant/chat` → `text/event-stream` with events
 * `delta {text}`, `sources {sources}`, `followups {suggestions}`, `emergency`, `done`.
 * Endpoint and event names are provisional until the API contract ships.
 */
class KtorAssistantApi @Inject constructor(
    private val client: HttpClient,
    private val baseUrl: ApiBaseUrl,
    private val json: Json,
) : AssistantApi {

    override fun stream(request: AssistantRequestDto): Flow<AssistantStreamEvent> = flow {
        client.preparePost(baseUrl.resolve("v1/assistant/chat")) {
            contentType(ContentType.Application.Json)
            accept(ContentType.Text.EventStream)
            setBody(request)
        }.execute { response ->
            if (!response.status.isSuccess()) throw ApiException(response.status.value, "Assistant failed: ${response.status}")
            val channel = response.bodyAsChannel()
            val parser = SseParser()
            while (true) {
                val line = channel.readUTF8Line() ?: break
                val event = parser.feed(line) ?: continue
                val parsed = parse(event) ?: continue
                if (parsed == AssistantStreamEvent.Done) return@execute
                emit(parsed)
            }
            parser.finish()?.let(::parse)?.takeIf { it != AssistantStreamEvent.Done }?.let { emit(it) }
        }
    }

    private fun parse(event: SseEvent): AssistantStreamEvent? = when (event.event) {
        "delta", "message" -> AssistantStreamEvent.Delta(json.decodeFromString<DeltaDto>(event.data).text)
        "sources" -> AssistantStreamEvent.Sources(json.decodeFromString<SourcesDto>(event.data).sources)
        "followups" -> AssistantStreamEvent.FollowUps(json.decodeFromString<FollowUpsDto>(event.data).suggestions)
        "emergency" -> AssistantStreamEvent.Emergency
        "done" -> AssistantStreamEvent.Done
        else -> null // forward compatible: ignore unknown events
    }
}
