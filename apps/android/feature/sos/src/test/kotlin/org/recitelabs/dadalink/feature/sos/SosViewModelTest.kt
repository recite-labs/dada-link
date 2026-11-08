package org.recitelabs.dadalink.feature.sos

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.SosMessageLabels
import org.recitelabs.dadalink.core.domain.usecase.SendSosUseCase
import org.recitelabs.dadalink.core.model.UserSettings
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.TestData
import org.recitelabs.dadalink.core.testing.fake.FakeContentRepository
import org.recitelabs.dadalink.core.testing.fake.FakeLocationProvider
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSosRelay
import java.time.Clock

class SosViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    private val labels = SosMessageLabels("Location", "Time", "unknown")
    private val relay = FakeSosRelay()

    private fun viewModel(settings: FakeSettingsRepository) = SosViewModel(
        settings,
        FakeContentRepository(),
        SendSosUseCase(settings, FakeLocationProvider(TestData.riyadh), relay, Clock.systemUTC()),
    )

    @Test fun `loads contact and emergency number from the directory`() = runTest {
        val vm = viewModel(FakeSettingsRepository(UserSettings(trustedContact = TestData.almaz)))
        assertEquals(TestData.almaz, vm.uiState.value.contact)
        assertEquals("911", vm.uiState.value.emergencyNumber)
    }

    @Test fun `sending produces an outcome, then resets for send again`() = runTest {
        val vm = viewModel(FakeSettingsRepository(UserSettings(trustedContact = TestData.almaz)))

        vm.send("Meron needs help.", labels)

        val done = vm.uiState.value.phase as SosPhase.Done
        assertTrue(done.outcome.delivered)
        assertEquals(1, relay.relayed.size)
        vm.consumeResult()
        assertEquals(SosPhase.Ready, vm.uiState.value.phase)
    }

    @Test fun `no trusted contact`() = runTest {
        val vm = viewModel(FakeSettingsRepository())
        vm.send("help", labels)
        assertEquals(SosPhase.NoContact, vm.uiState.value.phase)
    }
}
