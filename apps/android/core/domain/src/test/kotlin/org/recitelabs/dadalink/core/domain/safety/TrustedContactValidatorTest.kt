package org.recitelabs.dadalink.core.domain.safety

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator.Problem
import org.recitelabs.dadalink.core.model.TrustedContact

class TrustedContactValidatorTest {
    private fun contact(name: String = "Almaz", phone: String? = null, telegram: String? = null) =
        TrustedContact(name, "Sister", phone, telegram)

    @Test fun `phone only is valid`() = assertTrue(TrustedContactValidator.problems(contact(phone = "+251 91 100 0000")).isEmpty())

    @Test fun `telegram only is valid`() = assertTrue(TrustedContactValidator.problems(contact(telegram = "@almaz_t")).isEmpty())

    @Test fun `requires a name and a channel`() = assertEquals(
        setOf(Problem.NAME_MISSING, Problem.NO_CHANNEL),
        TrustedContactValidator.problems(contact(name = " ")),
    )

    @Test fun `flags malformed phone and handle`() = assertEquals(
        setOf(Problem.PHONE_INVALID, Problem.TELEGRAM_INVALID),
        TrustedContactValidator.problems(contact(phone = "12ab", telegram = "@a")),
    )

    @Test fun `normalises phone and telegram`() {
        assertEquals("+251911000000", TrustedContactValidator.normalizePhone(" +251 (91) 100-0000 "))
        assertEquals("@almaz_t", TrustedContactValidator.normalizeTelegram("almaz_t"))
    }
}
