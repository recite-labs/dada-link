package org.recitelabs.dadalink.core.network

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.MockRequestHandleScope
import io.ktor.client.engine.mock.respond
import io.ktor.client.engine.mock.toByteArray
import io.ktor.client.request.HttpRequestData
import io.ktor.client.request.HttpResponseData
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import org.recitelabs.dadalink.core.network.di.DadaJson

/** Reads a fixture captured from the live API (src/test/resources/fixtures). */
fun fixture(name: String): String =
    requireNotNull(object {}.javaClass.getResource("/fixtures/$name")) { "missing fixture $name" }.readText()

/** A request as seen by the server: method, full URL and body text. */
data class Recorded(val method: String, val url: String, val body: String, val accept: String?)

class TestHttp {
    val baseUrl = ApiBaseUrl("https://api.test")
    val json = DadaJson
    val requests = mutableListOf<Recorded>()

    /** Responds to every request with [body]/[status], or calls [handler] when given. */
    fun client(
        body: String = "",
        status: HttpStatusCode = HttpStatusCode.OK,
        contentType: String = "application/json",
        handler: (suspend MockRequestHandleScope.(HttpRequestData) -> HttpResponseData)? = null,
    ): HttpClient = HttpClient(MockEngine { req ->
        requests += Recorded(req.method.value, req.url.toString(), String(req.body.toByteArray()), req.headers[HttpHeaders.Accept])
        handler?.invoke(this, req) ?: respond(body, status, headersOf(HttpHeaders.ContentType, contentType))
    }) { expectSuccess = false }
}
