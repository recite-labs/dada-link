package org.recitelabs.dadalink.feature.disguise

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
import org.recitelabs.dadalink.feature.disguise.calculator.CalcKey
import org.recitelabs.dadalink.feature.disguise.calculator.CalculatorViewModel
import org.recitelabs.dadalink.feature.disguise.calculator.Operator
import org.recitelabs.dadalink.feature.disguise.notes.NotesViewModel

class UnlockViewModelsTest {
    @get:Rule val main = MainDispatcherRule()

    private val lock = FakeSessionLock()
    private val unlock = UnlockWithPinUseCase(FakePinRepository("2071"), lock)

    private fun CalculatorViewModel.type(keys: String) = keys.forEach { c ->
        press(
            when (c) {
                '=' -> CalcKey.Equals
                '+' -> CalcKey.Op(Operator.ADD)
                else -> CalcKey.Digit(c - '0')
            },
        )
    }

    @Test fun `calculator unlocks on PIN then equals`() = runTest {
        val vm = CalculatorViewModel(unlock)
        vm.type("2071=")
        assertTrue(lock.isUnlocked.value)
        assertEquals("2071", vm.uiState.value.display)
    }

    @Test fun `calculator keeps calculating with wrong pins and sums`() = runTest {
        val vm = CalculatorViewModel(unlock)
        vm.type("2070=")
        vm.type("2000+71=")
        assertFalse(lock.isUnlocked.value)
        assertEquals("2071", vm.uiState.value.display)
    }

    @Test fun `notes unlock via search`() = runTest {
        val vm = NotesViewModel(unlock)
        vm.search("shopping")
        assertFalse(lock.isUnlocked.value)
        vm.search(" 2071 ")
        assertTrue(lock.isUnlocked.value)
    }
}
