package org.recitelabs.dadalink.feature.assistant

import androidx.lifecycle.SavedStateHandle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.EmergencyDetector
import org.recitelabs.dadalink.core.domain.usecase.AskDadaUseCase
import org.recitelabs.dadalink.core.domain.usecase.SendAssistantFeedbackUseCase
import org.recitelabs.dadalink.core.model.AssistantError
import org.recitelabs.dadalink.core.model.AssistantEvent
import org.recitelabs.dadalink.core.model.AssistantException
import org.recitelabs.dadalink.core.model.EmergencyContact
import org.recitelabs.dadalink.core.model.EmergencyNotice
import org.recitelabs.dadalink.core.model.ChatRole
import org.recitelabs.dadalink.core.model.SourceRef
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.fake.FakeAssistantRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.io.IOException

/** Robolectric because SavedStateHandle.toRoute decodes through Android's Bundle. */
@RunWith(RobolectricTestRunner::class)
class AskViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    private val assistant = FakeAssistantRepository(
        events = listOf(
            AssistantEvent.TextDelta("No. "),
            AssistantEvent.TextDelta("It is yours."),
            AssistantEvent.Sources(listOf(SourceRef("Rights", "Team"))),
            AssistantEvent.FollowUps(listOf("How do I report it?")),
        ),
    )

    private val settings = FakeSettingsRepository()

    private fun viewModel(handle: SavedStateHandle = SavedStateHandle()) = AskViewModel(
        AskDadaUseCase(assistant, settings, EmergencyDetector()),
        SendAssistantFeedbackUseCase(assistant, settings),
        handle,
    )

    @Test fun `streams an answer into a single assistant message`() = runTest {
        val vm = viewModel()
        vm.onAction(AskAction.InputChanged("Can they keep my passport?"))
        vm.onAction(AskAction.Send)

        val state = vm.uiState.value
        assertEquals("", state.input)
        assertFalse(state.isAnswering)
        assertEquals(listOf(ChatRole.USER, ChatRole.ASSISTANT), state.messages.map { it.role })
        val answer = state.messages.last()
        assertEquals("No. It is yours.", answer.text)
        assertFalse(answer.isStreaming)
        assertEquals(listOf("How do I report it?"), answer.followUps)
        assertEquals("Rights", answer.sources.single().title)
    }

    @Test fun `errors can be retried`() = runTest {
        assistant.failure = IOException("offline")
        val vm = viewModel()
        vm.onAction(AskAction.Ask("hello"))
        assertEquals(AssistantError.OFFLINE, vm.uiState.value.messages.last().error)

        assistant.failure = null
        vm.onAction(AskAction.Retry)
        assertFalse(vm.uiState.value.messages.last().isError)
        assertEquals(2, vm.uiState.value.messages.size)
    }

    @Test fun `danger shows the emergency banner`() = runTest {
        val vm = viewModel()
        vm.onAction(AskAction.Ask("they locked me in"))
        assertTrue(vm.uiState.value.showEmergency)
    }

    @Test fun `initial question from the route is sent automatically`() = runTest {
        val vm = viewModel(SavedStateHandle(mapOf("question" to "My salary is late", "voice" to false)))
        assertEquals("My salary is late", vm.uiState.value.messages.first().text)
    }

    @Test fun `server emergency notice is attached to the answer and replaces the generic banner`() = runTest {
        val notice = EmergencyNotice("If you are in danger right now, press SOS…", listOf(EmergencyContact("Police", "999")))
        assistant.events = listOf(AssistantEvent.Emergency(notice), AssistantEvent.TextDelta("I'm so sorry."))
        val vm = viewModel()

        vm.onAction(AskAction.Ask("he hits me"))

        val state = vm.uiState.value
        assertEquals(notice, state.messages.last().emergency)
        assertTrue(state.showEmergency)
        assertFalse(state.showEmergencyBanner)
    }

    @Test fun `quota and outage map to their own messages`() = runTest {
        assistant.events = emptyList()
        assistant.failure = AssistantException(AssistantError.QUOTA, retryAfterSeconds = 3600)
        val vm = viewModel()
        vm.onAction(AskAction.Ask("salary"))
        assertEquals(AssistantError.QUOTA, vm.uiState.value.messages.last().error)

        assistant.failure = AssistantException(AssistantError.UNAVAILABLE)
        vm.onAction(AskAction.Retry)
        assertEquals(AssistantError.UNAVAILABLE, vm.uiState.value.messages.last().error)
    }

    @Test fun `feedback is sent once with cited content ids only`() = runTest {
        assistant.events = listOf(AssistantEvent.TextDelta("Yes."), AssistantEvent.Sources(listOf(SourceRef("Wages", null, "abroad-unpaid-wages"))))
        val vm = viewModel()
        vm.onAction(AskAction.Ask("salary"))
        val id = vm.uiState.value.messages.last().id

        vm.onAction(AskAction.Feedback(id, helpful = true))
        vm.onAction(AskAction.Feedback(id, helpful = false))

        assertEquals(listOf(true to listOf("abroad-unpaid-wages")), assistant.feedback)
        assertEquals(true, vm.uiState.value.messages.last().feedback)
    }
}
