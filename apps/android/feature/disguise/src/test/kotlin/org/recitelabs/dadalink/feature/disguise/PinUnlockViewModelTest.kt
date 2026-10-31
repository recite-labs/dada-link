package org.recitelabs.dadalink.feature.disguise

import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.domain.usecase.UnlockWithPinUseCase
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.fake.FakePinRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSessionLock
import org.recitelabs.dadalink.feature.disguise.unlock.PinUnlockViewModel

class PinUnlockViewModelTest {
    @get:Rule val main = MainDispatcherRule(StandardTestDispatcher())

    private val lock = FakeSessionLock()
    private val vm = PinUnlockViewModel(UnlockWithPinUseCase(FakePinRepository("2071"), lock))

    private fun kotlinx.coroutines.test.TestScope.enter(pin: String) {
        pin.forEach(vm::onDigit)
        runCurrent()
    }

    @Test fun `wrong pin shows an error and clears`() = runTest(main.dispatcher) {
        enter("1111")
        assertTrue(vm.uiState.value.isWrong)
        assertEquals("", vm.uiState.value.entered)
        assertFalse(lock.isUnlocked.value)
    }

    @Test fun `locks out for 30 seconds after five wrong tries`() = runTest(main.dispatcher) {
        repeat(5) { enter("1111") }
        assertEquals(30, vm.uiState.value.lockoutSeconds)

        enter("2071") // ignored while locked out
        assertFalse(lock.isUnlocked.value)

        advanceTimeBy(31_000)
        runCurrent()
        assertEquals(0, vm.uiState.value.lockoutSeconds)
        enter("2071")
        assertTrue(lock.isUnlocked.value)
    }
}
