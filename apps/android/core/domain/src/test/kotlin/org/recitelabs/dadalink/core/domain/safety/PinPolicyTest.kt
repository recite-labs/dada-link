package org.recitelabs.dadalink.core.domain.safety

import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.domain.safety.PinPolicy.Verdict

class PinPolicyTest {
    @Test fun `accepts four non-trivial digits`() = assertEquals(Verdict.VALID, PinPolicy.check("2071"))
    @Test fun `rejects wrong length`() {
        assertEquals(Verdict.WRONG_LENGTH, PinPolicy.check("123"))
        assertEquals(Verdict.WRONG_LENGTH, PinPolicy.check("20711"))
    }
    @Test fun `rejects non digits`() = assertEquals(Verdict.NOT_DIGITS, PinPolicy.check("12a4"))
    @Test fun `rejects repeated and sequential pins`() {
        assertEquals(Verdict.TOO_SIMPLE, PinPolicy.check("0000"))
        assertEquals(Verdict.TOO_SIMPLE, PinPolicy.check("1234"))
        assertEquals(Verdict.TOO_SIMPLE, PinPolicy.check("4321"))
    }
}
