package org.recitelabs.dadalink.core.network

import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.network.model.GeoLocationDto
import org.recitelabs.dadalink.core.network.model.SosRequestDto
import org.recitelabs.dadalink.core.network.model.TrustedContactDto

class SosApiTest {
    private val http = TestHttp()
    private val request = SosRequestDto(
        deviceId = "0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01",
        locale = "am",
        country = "SA",
        trustedContact = TrustedContactDto(phone = "+251911000000"),
        message = "Meron needs help.",
        location = GeoLocationDto(24.7136, 46.6753),
    )

    @Test fun `posts the request without null keys and reads the result`() = runTest {
        val api = KtorSosApi(http.client("""{"deliveredVia":["sms"],"failedVia":["telegram"]}"""), http.baseUrl, http.json)

        val result = api.relay(request)

        val sent = http.requests.single()
        assertEquals("POST", sent.method)
        assertEquals("https://api.test/safety/sos", sent.url)
        assertEquals(
            """{"deviceId":"0b6c6b1e-0d55-4e8e-9f3a-2f7a1c9d8e01","locale":"am","country":"SA",""" +
                """"trustedContact":{"phone":"+251911000000"},"message":"Meron needs help.",""" +
                """"location":{"latitude":24.7136,"longitude":46.6753}}""",
            sent.body,
        )
        assertEquals(listOf("sms"), result.deliveredVia)
        assertEquals(listOf("telegram"), result.failedVia)
    }

    @Test fun `503 means no channel succeeded`() = runTest {
        val api = KtorSosApi(http.client("""{"_tag":"UpstreamUnavailable","service":"sms"}""", HttpStatusCode.ServiceUnavailable), http.baseUrl, http.json)
        val error = runCatching { api.relay(request) }.exceptionOrNull()
        assertEquals("sms", (error as ApiException.Upstream).service)
    }

    @Test fun `429 is RateLimited`() = runTest {
        val api = KtorSosApi(
            http.client("""{"_tag":"RateLimited","scope":"sos","retryAfterSeconds":600}""", HttpStatusCode.TooManyRequests),
            http.baseUrl,
            http.json,
        )
        val error = runCatching { api.relay(request) }.exceptionOrNull() as ApiException.RateLimited
        assertEquals(600L, error.retryAfterSeconds)
    }
}
