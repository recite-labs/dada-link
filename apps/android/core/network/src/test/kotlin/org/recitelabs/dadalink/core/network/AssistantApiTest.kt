package org.recitelabs.dadalink.core.network

import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.network.model.AskRequestDto
import org.recitelabs.dadalink.core.network.model.AssistantFeedbackDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto.Citations
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto.Delta
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto.Emergency

class AssistantApiTest {
    private val http = TestHttp()
    private val request = AskRequestDto(
        deviceId = "0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01",
        locale = "en",
        country = "SA",
        phase = "abroad",
        question = "My employer hits me and took my passport. What can I do?",
    )

    private fun api(body: String, status: HttpStatusCode = HttpStatusCode.OK, contentType: String = "text/event-stream") =
        KtorAssistantApi(http.client(body, status, contentType), http.baseUrl, http.json)

    @Test fun `streams a real emergency answer - notice, citations, then text`() = runTest {
        val events = api(fixture("stream_emergency.txt")).stream(request).toList()

        val sent = http.requests.single()
        assertEquals("https://api.test/assistant/ask/stream", sent.url)
        assertEquals("text/event-stream", sent.accept)
        assertEquals(
            """{"deviceId":"0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01","locale":"en","country":"SA","phase":"abroad",""" +
                """"question":"My employer hits me and took my passport. What can I do?"}""",
            sent.body,
        )
        val notice = (events[0] as Emergency).notice
        assertEquals(listOf("violence"), notice.categories)
        assertEquals(listOf("911", "999", "997", "998"), notice.contacts.map { it.phone })
        assertTrue(notice.message.startsWith("If you are in danger right now, press SOS"))
        val citations = events[1] as Citations
        assertTrue(citations.grounded)
        assertEquals("faq-employer-hits-me", citations.citations.first().contentId)
        val text = events.drop(2).map { (it as Delta).text }.joinToString("")
        assertTrue(text.startsWith("I'm so sorry this is happening to you."))
        assertTrue(text.endsWith("[3] My employer took my passport. What can I do?"))
        assertTrue("Done is consumed, not emitted", events.none { it is AssistantStreamEventDto.Done })
    }

    @Test fun `stops at Done and ignores unknown tags and comments`() = runTest {
        val body = """
            : keep-alive
            data: {"_tag":"Citations","citations":[],"grounded":false}

            data: {"_tag":"FollowUps","suggestions":["x"]}

            data: {"_tag":"Delta","text":"Hi"}

            data: {"_tag":"Done"}

            data: {"_tag":"Delta","text":"after done"}

        """.trimIndent()

        val events = api(body).stream(request).toList()

        assertEquals(listOf(Citations(emptyList(), grounded = false), Delta("Hi")), events)
    }

    @Test fun `stream failure event becomes Upstream after the text so far`() = runTest {
        val body = "data: {\"_tag\":\"Delta\",\"text\":\"Hi\"}\n\n" +
            "event: effect/http-api/stream/failure\ndata: {\"_tag\":\"UpstreamUnavailable\",\"service\":\"workers-ai\"}\n\n"
        val received = mutableListOf<AssistantStreamEventDto>()

        val error = runCatching { api(body).stream(request).collect { received += it } }.exceptionOrNull()

        assertEquals(listOf<AssistantStreamEventDto>(Delta("Hi")), received)
        assertEquals("workers-ai", (error as ApiException.Upstream).service)
    }

    @Test fun `429 quota is RateLimited before any event`() = runTest {
        val body = """{"_tag":"RateLimited","scope":"assistant","retryAfterSeconds":3600}"""
        val error = runCatching { api(body, HttpStatusCode.TooManyRequests, "application/json").stream(request).toList() }.exceptionOrNull()
        val limited = error as ApiException.RateLimited
        assertEquals("assistant", limited.scope)
        assertEquals(3600L, limited.retryAfterSeconds)
    }

    @Test fun `non-streaming ask returns answer, citations and notice`() = runTest {
        val body = """
            {"locale":"en","answer":"If you are in danger…\n\nYour salary…","citations":[{"contentId":"abroad-unpaid-wages","title":"Unpaid wages","locale":"en"}],
            "emergency":{"categories":["violence"],"message":"If you are in danger…","contacts":[{"name":"Police","kind":"police","phone":"999"}]},"grounded":true}
        """.trimIndent()
        val answer = api(body, contentType = "application/json").ask(request.copy(country = null, phase = null))

        assertEquals(
            """{"deviceId":"0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01","locale":"en","question":"My employer hits me and took my passport. What can I do?"}""",
            http.requests.single().body,
        )
        assertEquals("https://api.test/assistant/ask", http.requests.single().url)
        assertEquals("999", answer.emergency!!.contacts.single().phone)
        assertTrue(answer.answer.startsWith(answer.emergency!!.message))
    }

    @Test fun `non-streaming ask with no emergency`() = runTest {
        val body = """{"locale":"am","answer":"…","citations":[],"emergency":null,"grounded":false}"""
        val answer = api(body, contentType = "application/json").ask(request)
        assertEquals(null, answer.emergency)
    }

    @Test fun `feedback posts content-free payload`() = runTest {
        api("", HttpStatusCode.NoContent).feedback(AssistantFeedbackDto(helpful = true, locale = "am", contentIds = listOf("abroad-unpaid-wages")))

        assertEquals("https://api.test/assistant/feedback", http.requests.single().url)
        assertEquals("""{"helpful":true,"locale":"am","contentIds":["abroad-unpaid-wages"]}""", http.requests.single().body)
    }
}
