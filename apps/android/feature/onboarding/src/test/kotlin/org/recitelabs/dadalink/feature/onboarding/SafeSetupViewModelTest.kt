package org.recitelabs.dadalink.feature.onboarding

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.PinPolicy
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator.Problem
import org.recitelabs.dadalink.core.domain.usecase.CompleteSafeSetupUseCase
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.fake.FakeDisguiseController
import org.recitelabs.dadalink.core.testing.fake.FakePinRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSessionLock
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository
import org.recitelabs.dadalink.feature.onboarding.setup.SafeSetupAction
import org.recitelabs.dadalink.feature.onboarding.setup.SafeSetupViewModel

class SafeSetupViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    private val settings = FakeSettingsRepository()
    private val pins = FakePinRepository()
    private val lock = FakeSessionLock()
    private val disguise = FakeDisguiseController()
    private val viewModel = SafeSetupViewModel(CompleteSafeSetupUseCase(settings, pins, disguise), lock)

    @Test fun `weak pin shows an error and nothing is saved`() = runTest {
        viewModel.onAction(SafeSetupAction.PinChanged("1111"))
        viewModel.onAction(SafeSetupAction.Submit)

        assertEquals(PinPolicy.Verdict.TOO_SIMPLE, viewModel.uiState.value.pinError)
        assertFalse(viewModel.uiState.value.isComplete)
        assertFalse(lock.isUnlocked.value)
    }

    @Test fun `half-filled contact is validated`() = runTest {
        viewModel.onAction(SafeSetupAction.PinChanged("2071"))
        viewModel.onAction(SafeSetupAction.ContactNameChanged("Almaz"))
        viewModel.onAction(SafeSetupAction.Submit)

        assertEquals(setOf(Problem.NO_CHANNEL), viewModel.uiState.value.contactProblems)
    }

    @Test fun `valid setup completes, unlocks and clears the pin from state`() = runTest {
        with(viewModel) {
            onAction(SafeSetupAction.NicknameChanged("Meron"))
            onAction(SafeSetupAction.PinChanged("2071"))
            onAction(SafeSetupAction.DisguiseChanged(DisguiseMode.NOTES))
            onAction(SafeSetupAction.ContactNameChanged("Almaz"))
            onAction(SafeSetupAction.ContactPhoneChanged("+251911000000"))
            onAction(SafeSetupAction.Submit)
        }

        val state = viewModel.uiState.value
        assertTrue(state.isComplete)
        assertEquals("", state.pin)
        assertTrue(lock.isUnlocked.value)
        assertTrue(settings.settings.first().isOnboarded)
        assertEquals(listOf(DisguiseMode.NOTES), disguise.applied)
    }
}
