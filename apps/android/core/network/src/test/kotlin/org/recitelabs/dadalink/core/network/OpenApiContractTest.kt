package org.recitelabs.dadalink.core.network

import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.descriptors.elementNames
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.JourneyPhase
import org.recitelabs.dadalink.core.network.model.AgencyCheckDto
import org.recitelabs.dadalink.core.network.model.AgencyDto
import org.recitelabs.dadalink.core.network.model.AskRequestDto
import org.recitelabs.dadalink.core.network.model.AskResponseDto
import org.recitelabs.dadalink.core.network.model.AssistantFeedbackDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto
import org.recitelabs.dadalink.core.network.model.CitationDto
import org.recitelabs.dadalink.core.network.model.ContentSummaryDto
import org.recitelabs.dadalink.core.network.model.DirectoryEntryDto
import org.recitelabs.dadalink.core.network.model.EmergencyContactDto
import org.recitelabs.dadalink.core.network.model.EmergencyNoticeDto
import org.recitelabs.dadalink.core.network.model.GeoLocationDto
import org.recitelabs.dadalink.core.network.model.HealthStatusDto
import org.recitelabs.dadalink.core.network.model.LocalizedContentDto
import org.recitelabs.dadalink.core.network.model.LocalizedNamesDto
import org.recitelabs.dadalink.core.network.model.NotFoundDto
import org.recitelabs.dadalink.core.network.model.RateLimitedDto
import org.recitelabs.dadalink.core.network.model.SosRequestDto
import org.recitelabs.dadalink.core.network.model.SosResultDto
import org.recitelabs.dadalink.core.network.model.SourceDto
import org.recitelabs.dadalink.core.network.model.TrustedContactDto
import org.recitelabs.dadalink.core.network.model.UpstreamUnavailableDto
import org.recitelabs.dadalink.core.network.model.ValidationFailedDto
import java.io.File

/**
 * Keeps the hand-written DTOs honest against packages/api/openapi.json (the backend contract).
 * Fails when a field is added/removed/renamed, when required-ness or nullability differ, when a
 * route the app calls disappears, or when an enum the app maps (Locale, Country, JourneyPhase)
 * no longer covers the app's values.
 */
class OpenApiContractTest {
    private val spec: JsonObject = Json.parseToJsonElement(
        File(requireNotNull(System.getProperty("dadalink.openapi")) { "run through Gradle (sets dadalink.openapi)" }).readText(),
    ).jsonObject
    private val schemas = spec["components"]!!.jsonObject["schemas"]!!.jsonObject

    /** Every object schema the client reads or writes, with its mirror. */
    private val mirrors: Map<String, KSerializer<*>> = mapOf(
        "HealthStatusEncoded" to HealthStatusDto.serializer(),
        "ContentSummaryEncoded" to ContentSummaryDto.serializer(),
        "LocalizedContentEncoded" to LocalizedContentDto.serializer(),
        "SourceEncoded" to SourceDto.serializer(),
        "DirectoryEntryEncoded" to DirectoryEntryDto.serializer(),
        "LocalizedNames" to LocalizedNamesDto.serializer(),
        "EmergencyContactEncoded" to EmergencyContactDto.serializer(),
        "EmergencyNoticeEncoded" to EmergencyNoticeDto.serializer(),
        "CitationEncoded" to CitationDto.serializer(),
        "AgencyCheckEncoded" to AgencyCheckDto.serializer(),
        "AgencyEncoded" to AgencyDto.serializer(),
        "AskRequest" to AskRequestDto.serializer(),
        "AskResponseEncoded" to AskResponseDto.serializer(),
        "AssistantFeedback" to AssistantFeedbackDto.serializer(),
        "SosRequest" to SosRequestDto.serializer(),
        "TrustedContact" to TrustedContactDto.serializer(),
        "GeoLocation" to GeoLocationDto.serializer(),
        "SosResultEncoded" to SosResultDto.serializer(),
        "RateLimitedEncoded" to RateLimitedDto.serializer(),
        "UpstreamUnavailableEncoded" to UpstreamUnavailableDto.serializer(),
        "NotFoundEncoded" to NotFoundDto.serializer(),
        "ValidationFailedEncoded" to ValidationFailedDto.serializer(),
    )

    /** `AssistantStreamEvent` is an `anyOf` of `_tag`ged objects. */
    private val streamEvents: Map<String, KSerializer<*>> = mapOf(
        AssistantStreamEventDto.Emergency.TAG to AssistantStreamEventDto.Emergency.serializer(),
        AssistantStreamEventDto.Citations.TAG to AssistantStreamEventDto.Citations.serializer(),
        AssistantStreamEventDto.Delta.TAG to AssistantStreamEventDto.Delta.serializer(),
        AssistantStreamEventDto.Done.TAG to AssistantStreamEventDto.Done.serializer(),
    )

    @Test fun `every mirrored schema matches its DTO`() {
        val problems = mirrors.flatMap { (name, serializer) ->
            val schema = schemas[name]?.jsonObject ?: return@flatMap listOf("$name: schema missing from openapi.json")
            compare(name, schema, serializer.descriptor)
        }
        assertTrue(problems.joinToString("\n"), problems.isEmpty())
    }

    @Test fun `every assistant stream event matches its DTO`() {
        val variants = schemas["AssistantStreamEvent"]!!.jsonObject["anyOf"]!!.jsonArray.map { it.jsonObject }
        val byTag = variants.associateBy { it["properties"]!!.jsonObject["_tag"]!!.jsonObject["enum"]!!.jsonArray.single().jsonPrimitive.content }
        assertEquals("stream event tags", streamEvents.keys, byTag.keys)
        val problems = streamEvents.flatMap { (tag, serializer) -> compare("AssistantStreamEvent.$tag", byTag.getValue(tag), serializer.descriptor) }
        assertTrue(problems.joinToString("\n"), problems.isEmpty())
        val stream = spec["paths"]!!.jsonObject[ApiRoutes.ASSISTANT_ASK_STREAM]!!.jsonObject["post"]!!.jsonObject
        val sse = stream["responses"]!!.jsonObject["200"]!!.jsonObject["content"]!!.jsonObject["text/event-stream"]!!.jsonObject
        assertEquals(KtorAssistantApi.FAILURE_EVENT, sse["x-effect-stream"]!!.jsonObject["failureEvent"]!!.jsonPrimitive.content)
    }

    @Test fun `every route the client calls exists with that method`() {
        val paths = spec["paths"]!!.jsonObject
        val missing = ApiRoutes.all.filter { (method, path) -> paths[path]?.jsonObject?.get(method) == null }
        assertTrue("missing routes: $missing", missing.isEmpty())
    }

    @Test fun `request bodies and query parameters use the mirrored schemas`() {
        val paths = spec["paths"]!!.jsonObject
        fun bodyRef(path: String) = paths[path]!!.jsonObject["post"]!!.jsonObject["requestBody"]!!.jsonObject["content"]!!
            .jsonObject["application/json"]!!.jsonObject["schema"]!!.jsonObject["\$ref"]!!.jsonPrimitive.content.substringAfterLast('/')
        assertEquals("AskRequest", bodyRef(ApiRoutes.ASSISTANT_ASK_STREAM))
        assertEquals("AssistantFeedback", bodyRef(ApiRoutes.ASSISTANT_FEEDBACK))
        assertEquals("SosRequest", bodyRef(ApiRoutes.SAFETY_SOS))
        val contentParams = paths[ApiRoutes.CONTENT]!!.jsonObject["get"]!!.jsonObject["parameters"]!!.jsonArray
            .map { it.jsonObject["name"]!!.jsonPrimitive.content }.toSet()
        assertEquals(setOf("locale", "country", "phase", "kind", "topic"), contentParams)
    }

    @Test fun `app enums are accepted by the API`() {
        fun literals(name: String) = schemas[name]!!.jsonObject["enum"]!!.jsonArray.map { it.jsonPrimitive.content }.toSet()
        assertEquals("Country", literals("Country"), Country.entries.map { it.isoCode }.toSet())
        assertEquals("JourneyPhase", literals("JourneyPhase"), JourneyPhase.entries.map { it.wireValue }.toSet())
        val unsupported = AppLanguage.entries.map { it.tag }.filterNot { it in literals("Locale") }
        assertTrue("app languages the API does not accept: $unsupported", unsupported.isEmpty())
    }

    private fun compare(name: String, schema: JsonObject, descriptor: SerialDescriptor): List<String> {
        val properties = schema["properties"]?.jsonObject ?: JsonObject(emptyMap())
        val required = schema["required"]?.jsonArray?.map { it.jsonPrimitive.content }?.toSet().orEmpty()
        val fields = descriptor.elementNames.toList()
        val problems = mutableListOf<String>()
        (properties.keys - fields.toSet()).forEach { problems += "$name.$it: in the spec, missing from ${descriptor.serialName}" }
        (fields.toSet() - properties.keys).forEach { problems += "$name.$it: in ${descriptor.serialName}, not in the spec" }
        fields.filter { it in properties }.forEach { field ->
            val index = descriptor.getElementIndex(field)
            val optionalInDto = descriptor.isElementOptional(index)
            val nullableInDto = descriptor.getElementDescriptor(index).isNullable
            val isRequired = field in required
            val nullableInSpec = properties.getValue(field).isNullable()
            when {
                field == "_tag" -> Unit // constant discriminator, defaulted for convenience
                isRequired && optionalInDto -> problems += "$name.$field: required in the spec, has a default in the DTO"
                !isRequired && !optionalInDto -> problems += "$name.$field: optional in the spec, needs a default in the DTO"
                isRequired && nullableInSpec != nullableInDto ->
                    problems += "$name.$field: nullable in spec=$nullableInSpec, in DTO=$nullableInDto"
            }
        }
        return problems
    }

    private fun JsonElement.isNullable(): Boolean {
        val anyOf = (this as? JsonObject)?.get("anyOf") as? JsonArray ?: return false
        return anyOf.any { (it as? JsonObject)?.get("type")?.jsonPrimitive?.content == "null" }
    }
}
