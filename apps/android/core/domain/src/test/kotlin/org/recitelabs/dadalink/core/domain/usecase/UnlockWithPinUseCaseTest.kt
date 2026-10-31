package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.testing.fake.FakePinRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSessionLock

class UnlockWithPinUseCaseTest {
    private val lock = FakeSessionLock()
    private val useCase = UnlockWithPinUseCase(FakePinRepository("2071"), lock)

    @Test fun `correct pin unlocks`() = runTest {
        assertTrue(useCase("2071"))
        assertTrue(lock.isUnlocked.value)
    }

    @Test fun `wrong pin keeps the session locked`() = runTest {
        assertFalse(useCase("2070"))
        assertFalse(lock.isUnlocked.value)
    }
}
