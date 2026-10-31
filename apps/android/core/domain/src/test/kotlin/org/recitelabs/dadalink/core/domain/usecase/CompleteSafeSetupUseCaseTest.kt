package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.PinPolicy
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import org.recitelabs.dadalink.core.testing.fake.FakeDisguiseController
import org.recitelabs.dadalink.core.testing.fake.FakePinRepository
import org.recitelabs.dadalink.core.testing.fake.FakeSettingsRepository

class CompleteSafeSetupUseCaseTest {
    private val settings = FakeSettingsRepository()
    private val pins = FakePinRepository()
    private val disguise = FakeDisguiseController()
    private val useCase = CompleteSafeSetupUseCase(settings, pins, disguise)

    private val valid = SafeSetup(
        nickname = " Meron ",
        pin = "2071",
        disguise = DisguiseMode.CALCULATOR,
        trustedContact = TrustedContact(" Almaz ", "Sister", "+251 91 100 0000", ""),
        hideNotificationContent = true,
    )

    @Test fun `saves normalised setup and applies disguise`() = runTest {
        assertEquals(SafeSetupResult.Saved, useCase(valid))

        val saved = settings.settings.first()
        assertTrue(saved.isOnboarded)
        assertEquals("Meron", saved.nickname)
        assertEquals(TrustedContact("Almaz", "Sister", "+251911000000", null), saved.trustedContact)
        assertEquals(DisguiseMode.CALCULATOR, saved.disguise)
        assertEquals("2071", pins.pin)
        assertEquals(listOf(DisguiseMode.CALCULATOR), disguise.applied)
    }

    @Test fun `contact is optional`() = runTest {
        assertEquals(SafeSetupResult.Saved, useCase(valid.copy(trustedContact = null)))
        assertNull(settings.settings.first().trustedContact)
    }

    @Test fun `rejects weak pin and bad contact without saving anything`() = runTest {
        val result = useCase(valid.copy(pin = "1111", trustedContact = TrustedContact("", "", "", "")))

        assertEquals(
            SafeSetupResult.Invalid(
                PinPolicy.Verdict.TOO_SIMPLE,
                setOf(TrustedContactValidator.Problem.NAME_MISSING, TrustedContactValidator.Problem.NO_CHANNEL),
            ),
            result,
        )
        assertNull(pins.pin)
        assertTrue(disguise.applied.isEmpty())
        assertEquals(false, settings.settings.first().isOnboarded)
    }
}
