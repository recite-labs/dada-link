package org.recitelabs.dadalink.core.data

import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.data.assistant.FakeAssistant
import org.recitelabs.dadalink.core.domain.safety.EmergencyDetector
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.ChatMessage
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.Country

class FakeAssistantTest {
    private val assistant = FakeAssistant(EmergencyDetector()).apply { wordDelayMillis = 0 }

    private suspend fun ask(text: String, lang: AppLanguage = AppLanguage.ENGLISH) =
        assistant.ask(listOf(ChatMessage("1", ChatRole.USER, text)), lang, Country.SAUDI_ARABIA).toList()

    private fun List<AssistantEvent>.text() = filterIsInstance<AssistantEvent.TextDelta>().joinToString("") { it.text }

    @Test fun `answers passport questions with a source and follow-ups`() = runTest {
        val events = ask("Can my madam keep my passport?")
        assertTrue(events.text().startsWith("No. In Saudi Arabia"))
        assertTrue(events.any { it is AssistantEvent.Sources && it.sources.isNotEmpty() })
        assertTrue(events.last() is AssistantEvent.FollowUps)
    }

    @Test fun `answers in amharic when asked in ge'ez script`() = runTest {
        assertTrue(ask("ደሞዜ ዘገየ").text().startsWith("ደሞዝሽ"))
    }

    @Test fun `emergencies lead with the emergency event`() = runTest {
        val events = ask("he beat me")
        assertEquals(AssistantEvent.EmergencyDetected, events.first())
        assertTrue(events.text().contains("SOS"))
    }
}
