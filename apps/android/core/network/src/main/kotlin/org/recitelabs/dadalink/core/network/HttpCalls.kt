package org.recitelabs.dadalink.core.network

import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.http.isSuccess
import kotlinx.serialization.DeserializationStrategy
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import org.recitelabs.dadalink.core.network.model.NotFoundDto
import org.recitelabs.dadalink.core.network.model.RateLimitedDto
import org.recitelabs.dadalink.core.network.model.UpstreamUnavailableDto
import org.recitelabs.dadalink.core.network.model.ValidationFailedDto

/** Decodes a 2xx body or maps the documented error bodies to [ApiException]s. */
internal suspend fun <T> HttpResponse.decodeOrThrow(json: Json, strategy: DeserializationStrategy<T>): T {
    throwIfError(json)
    val text = bodyAsText()
    return try {
        json.decodeFromString(strategy, text)
    } catch (e: SerializationException) {
        throw ApiException.Malformed(e)
    } catch (e: IllegalArgumentException) {
        throw ApiException.Malformed(e)
    }
}

/** Throws the [ApiException] matching a non-2xx response; no-op on success. */
internal suspend fun HttpResponse.throwIfError(json: Json) {
    if (status.isSuccess()) return
    val text = runCatching { bodyAsText() }.getOrDefault("")
    fun <E> parse(strategy: DeserializationStrategy<E>): E? = runCatching { json.decodeFromString(strategy, text) }.getOrNull()
    throw when (status) {
        HttpStatusCode.TooManyRequests -> parse(RateLimitedDto.serializer())
            .let { ApiException.RateLimited(it?.scope ?: "unknown", it?.retryAfterSeconds ?: retryAfterHeader()) }
        HttpStatusCode.ServiceUnavailable -> ApiException.Upstream(parse(UpstreamUnavailableDto.serializer())?.service)
        HttpStatusCode.NotFound -> parse(NotFoundDto.serializer()).let { ApiException.NotFound(it?.entity, it?.id) }
        HttpStatusCode.BadRequest -> ApiException.Invalid(parse(ValidationFailedDto.serializer())?.reason ?: "")
        else -> ApiException.Http(status.value)
    }
}

private fun HttpResponse.retryAfterHeader(): Long = headers["Retry-After"]?.toLongOrNull() ?: 0
