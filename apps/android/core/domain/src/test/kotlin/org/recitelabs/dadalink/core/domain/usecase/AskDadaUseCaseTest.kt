package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.EmergencyDetector
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.testing.fake.FakeAssistantRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository

class AskDadaUseCaseTest {
    private val assistant = FakeAssistantRepository(events = listOf(AssistantEvent.TextDelta("ok")))
    private val useCase = AskDadaUseCase(assistant, FakeSettingsRepository(), EmergencyDetector())

    private fun user(text: String) = ChatMessage("1", ChatRole.USER, text)

    @Test fun `streams the assistant answer`() = runTest {
        assertEquals(listOf(AssistantEvent.TextDelta("ok")), useCase(listOf(user("When is payday?"))).toList())
        assertEquals(1, assistant.requests.size)
    }

    @Test fun `leads with an emergency event when danger is detected`() = runTest {
        val events = useCase(listOf(user("He is hitting me"))).toList()
        assertEquals(AssistantEvent.EmergencyDetected, events.first())
        assertEquals(AssistantEvent.TextDelta("ok"), events.last())
    }

}
