package org.recitelabs.dadalink.core.network

import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.IOException

class ContentApiTest {
    private val http = TestHttp()
    private fun api(body: String, status: HttpStatusCode = HttpStatusCode.OK) =
        KtorContentApi(http.client(body, status), http.baseUrl, http.json)

    @Test fun `lists content summaries with every filter as query parameters`() = runTest {
        val items = api(fixture("content_en.json")).list(locale = "en", country = "SA", phase = "abroad", kind = "article", topic = "wages")

        assertEquals(56, items.size)
        assertEquals("https://api.test/content?locale=en&country=SA&phase=abroad&kind=article&topic=wages", http.requests.single().url)
        val first = items.first()
        assertEquals("abuse-what-to-do", first.id)
        assertEquals("abroad", first.phase)
        assertTrue(items.any { it.phase == null && it.kind == "faq" })
    }

    @Test fun `omits absent filters`() = runTest {
        api(fixture("content_am_SA_abroad.json")).list(locale = "am")
        assertEquals("https://api.test/content?locale=am", http.requests.single().url)
    }

    @Test fun `reads a localized item with sources and fallback info`() = runTest {
        val item = api(fixture("content_item.json")).item("abuse-what-to-do", "am")!!

        assertEquals("https://api.test/content/abuse-what-to-do?locale=am", http.requests.single().url)
        assertEquals("am", item.locale)
        assertEquals("am", item.requestedLocale)
        assertEquals("reviewed", item.status)
        assertTrue(item.body.isNotBlank())
        assertEquals(5, item.sources.size)
        assertEquals("International Labour Organization", item.sources.first().publisher)
    }

    @Test fun `missing item is null`() = runTest {
        assertNull(api(fixture("content_404.json"), HttpStatusCode.NotFound).item("nope", "en"))
    }

    @Test fun `reads the saudi directory in curated order`() = runTest {
        val entries = api(fixture("directory_SA.json")).directory("SA")

        assertEquals("https://api.test/directory/SA", http.requests.single().url)
        assertEquals(15, entries.size)
        val unified = entries.first()
        assertEquals("emergency", unified.kind)
        assertNull(unified.phone)
        assertEquals("911", unified.shortCode)
        assertEquals("የተዋሃደ የአስቸኳይ ጊዜ ቁጥር", unified.names?.am)
        assertTrue(unified.emergency)
        val embassy = entries.first { it.kind == "embassy" }
        assertEquals("+966114823919", embassy.phone)
    }

    @Test fun `reads localized emergency contacts`() = runTest {
        val contacts = api(fixture("directory_SA_emergency.json")).emergencyContacts("SA", "am")

        assertEquals("https://api.test/directory/SA/emergency?locale=am", http.requests.single().url)
        assertEquals(listOf("911", "999", "997", "998"), contacts.map { it.phone })
    }

    @Test fun `a body that breaks the contract is Malformed`() = runTest {
        val error = runCatching { api("""[{"id":1}]""").directory("SA") }.exceptionOrNull()
        assertTrue(error is ApiException.Malformed)
    }

    @Test fun `503 is Upstream and other statuses are Http`() = runTest {
        val upstream = runCatching { api("""{"_tag":"UpstreamUnavailable","service":"d1"}""", HttpStatusCode.ServiceUnavailable).list() }.exceptionOrNull()
        assertEquals("d1", (upstream as ApiException.Upstream).service)
        val http500 = runCatching { api("oops", HttpStatusCode.InternalServerError).list() }.exceptionOrNull()
        assertEquals(500, (http500 as ApiException.Http).status)
        assertTrue(!http500.isOffline)
    }

    @Test fun `connectivity failures are offline`() = runTest {
        val client = http.client { throw IOException("Unable to resolve host") }
        val error = runCatching { KtorContentApi(client, http.baseUrl, http.json).directory("SA") }.exceptionOrNull()
        assertTrue(error!!.isOffline)
    }

    @Test fun `path parameters are url-encoded`() = runTest {
        val client = http.client { respond(fixture("content_404.json"), HttpStatusCode.NotFound) }
        KtorContentApi(client, http.baseUrl, http.json).item("a b/c", null)
        assertEquals("https://api.test/content/a%20b%2Fc", http.requests.single().url)
    }
}
