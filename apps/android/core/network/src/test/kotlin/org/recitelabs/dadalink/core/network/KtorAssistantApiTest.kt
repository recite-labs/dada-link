package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.toByteArray
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.network.model.AssistantMessageDto
import org.recitelabs.dadalink.core.network.model.AssistantRequestDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEvent
import org.recitelabs.dadalink.core.network.model.SourceDto

class KtorAssistantApiTest {
    private val json = Json { ignoreUnknownKeys = true }
    private val request = AssistantRequestDto(listOf(AssistantMessageDto("user", "Can they keep my passport?")), "en", "SA")

    private fun api(status: HttpStatusCode, body: String, onRequest: (String, String) -> Unit = { _, _ -> }): AssistantApi {
        val engine = MockEngine { req ->
            onRequest(req.url.toString(), String(req.body.toByteArray()))
            respond(body, status, headersOf(HttpHeaders.ContentType, "text/event-stream"))
        }
        val client = HttpClient(engine) { install(ContentNegotiation) { json(json) } }
        return KtorAssistantApi(client, ApiBaseUrl("https://api.test/"), json)
    }

    @Test fun `streams deltas, sources and follow-ups until done`() = runTest {
        val body = """
            event: delta
            data: {"text":"No. "}

            event: delta
            data: {"text":"Your passport is yours."}

            event: sources
            data: {"sources":[{"title":"Rights in Saudi Arabia","reviewed_by":"DadaLink team"}]}

            event: followups
            data: {"suggestions":["What can I do?"]}

            event: done
            data: {}

            event: delta
            data: {"text":"ignored after done"}
        """.trimIndent() + "\n\n"
        var url = ""
        var sent = ""

        val events = api(HttpStatusCode.OK, body) { u, b -> url = u; sent = b }.stream(request).toList()

        assertEquals("https://api.test/v1/assistant/chat", url)
        assertTrue(sent.contains("\"locale\":\"en\""))
        assertEquals(
            listOf(
                AssistantStreamEvent.Delta("No. "),
                AssistantStreamEvent.Delta("Your passport is yours."),
                AssistantStreamEvent.Sources(listOf(SourceDto("Rights in Saudi Arabia", "DadaLink team"))),
                AssistantStreamEvent.FollowUps(listOf("What can I do?")),
            ),
            events,
        )
    }

    @Test(expected = ApiException::class)
    fun `non-2xx becomes an ApiException`() = runTest {
        api(HttpStatusCode.TooManyRequests, "").stream(request).toList()
    }
}
