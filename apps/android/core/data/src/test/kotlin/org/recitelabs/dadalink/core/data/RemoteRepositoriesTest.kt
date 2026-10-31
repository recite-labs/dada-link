package org.recitelabs.dadalink.core.data

import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.data.agency.RemoteAgencyRepository
import org.recitelabs.dadalink.core.data.assistant.RemoteAssistantRepository
import org.recitelabs.dadalink.core.data.device.DeviceIdProvider
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.model.AgencyStatus
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantError
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.AssistantException
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.EmergencyContact
import org.recitelabs.dadalink.core.model.EmergencyNotice
import org.recitelabs.dadalink.core.model.JourneyPhase
import org.recitelabs.dadalink.core.model.SourceRef
import org.recitelabs.dadalink.core.network.ApiException
import org.recitelabs.dadalink.core.network.model.AgencyCheckDto
import org.recitelabs.dadalink.core.network.model.AgencyDto
import org.recitelabs.dadalink.core.network.model.AssistantStreamEventDto
import org.recitelabs.dadalink.core.network.model.CitationDto
import org.recitelabs.dadalink.core.network.model.EmergencyContactDto
import org.recitelabs.dadalink.core.network.model.EmergencyNoticeDto
import java.io.IOException

class RemoteRepositoriesTest {
    private val source = settingsSource()
    private val deviceIds = DeviceIdProvider(source)
    private val conversation = listOf(
        ChatMessage("1", ChatRole.USER, "earlier question"),
        ChatMessage("2", ChatRole.ASSISTANT, "earlier answer"),
        ChatMessage("3", ChatRole.USER, "  He hits me  "),
    )

    @Test fun `device id is a random v4 uuid, created once and reused`() = runTest {
        val first = deviceIds.deviceId()
        assertTrue(Regex("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$").matches(first))
        assertEquals(first, deviceIds.deviceId())
        assertEquals(first, DeviceIdProvider(source).deviceId())
    }

    @Test fun `assistant sends only the last question with locale, country and phase`() = runTest {
        val api = FakeAssistantApi(
            events = listOf(
                AssistantStreamEventDto.Emergency(EmergencyNoticeDto(listOf("violence"), "Press SOS", listOf(EmergencyContactDto("Police", "police", "999")))),
                AssistantStreamEventDto.Citations(listOf(CitationDto("faq-employer-hits-me", "My employer hits me", "am")), grounded = true),
                AssistantStreamEventDto.Delta("ይቅርታ"),
            ),
        )

        val events = RemoteAssistantRepository(api, deviceIds).ask(conversation, AppLanguage.AMHARIC, Country.LEBANON, JourneyPhase.ABROAD).toList()

        val request = api.requests.single()
        assertEquals("He hits me", request.question)
        assertEquals("am", request.locale)
        assertEquals("LB", request.country)
        assertEquals("abroad", request.phase)
        assertEquals(deviceIds.deviceId(), request.deviceId)
        assertEquals(
            listOf(
                AssistantEvent.Emergency(EmergencyNotice("Press SOS", listOf(EmergencyContact("Police", "999")))),
                AssistantEvent.Sources(listOf(SourceRef("My employer hits me", null, "faq-employer-hits-me"))),
                AssistantEvent.TextDelta("ይቅርታ"),
            ),
            events,
        )
    }

    @Test fun `assistant failures become user-facing categories`() = runTest {
        suspend fun errorFor(failure: Exception): AssistantException {
            val repo = RemoteAssistantRepository(FakeAssistantApi(failure = failure), deviceIds)
            return runCatching { repo.ask(conversation, AppLanguage.ENGLISH, Country.SAUDI_ARABIA, JourneyPhase.ABROAD).toList() }
                .exceptionOrNull() as AssistantException
        }
        val quota = errorFor(ApiException.RateLimited("assistant", 3600))
        assertEquals(AssistantError.QUOTA, quota.error)
        assertEquals(3600L, quota.retryAfterSeconds)
        assertEquals(AssistantError.OFFLINE, errorFor(IOException("no route")).error)
        assertEquals(AssistantError.UNAVAILABLE, errorFor(ApiException.Upstream("workers-ai")).error)
        assertEquals(AssistantError.UNAVAILABLE, errorFor(ApiException.Http(500)).error)
    }

    @Test fun `feedback is best effort and capped`() = runTest {
        val api = FakeAssistantApi()
        val repo = RemoteAssistantRepository(api, deviceIds)
        repo.sendFeedback(true, AppLanguage.OROMO, List(30) { "id-$it" } + "id-0")
        assertEquals(20, api.feedback.single().contentIds.size)
        assertEquals("om", api.feedback.single().locale)

        api.feedbackFailure = IOException("offline")
        repo.sendFeedback(false, AppLanguage.OROMO, listOf("x")) // does not throw
    }

    @Test fun `agency verdicts map to results`() = runTest {
        fun dto(verdict: String, status: String = verdict) = AgencyCheckDto(
            "selam", verdict, if (verdict == "not-found") emptyList() else listOf(AgencyDto("a", "Selam PLC", null, status, region = "Addis Ababa", sourceUrl = "https://x")),
        )
        suspend fun check(result: () -> AgencyCheckDto) = RemoteAgencyRepository(FakeAgencyApi(result)).check("selam")

        assertEquals(AgencyCheckResult.Found(Agency("Selam PLC", null, AgencyStatus.LICENSED, "Addis Ababa")), check { dto("licensed") })
        assertEquals(AgencyStatus.REVOKED, (check { dto("revoked") } as AgencyCheckResult.Found).agency.status)
        assertEquals(AgencyStatus.UNKNOWN, (check { dto("unknown") } as AgencyCheckResult.Found).agency.status)
        assertEquals(AgencyCheckResult.NotFound, check { dto("not-found") })
        assertEquals(AgencyCheckResult.Offline, check { throw IOException("offline") })
        assertEquals(AgencyCheckResult.Invalid("too short"), check { throw ApiException.Invalid("too short") })
    }
}
