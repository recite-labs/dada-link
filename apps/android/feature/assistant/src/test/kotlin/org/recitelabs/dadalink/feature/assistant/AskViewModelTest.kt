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
import org.recitelabs.dadalink.core.model.AssistantEvent
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

    private fun viewModel() = AskViewModel(AskDadaUseCase(assistant, FakeSettingsRepository(), EmergencyDetector()), SavedStateHandle())

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
        assertTrue(vm.uiState.value.messages.last().isError)

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
        val vm = AskViewModel(
            AskDadaUseCase(assistant, FakeSettingsRepository(), EmergencyDetector()),
            SavedStateHandle(mapOf("question" to "My salary is late", "voice" to false)),
        )
        assertEquals("My salary is late", vm.uiState.value.messages.first().text)
    }
}
