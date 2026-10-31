package org.recitelabs.dadalink.core.domain.safety

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AgencyMatcherTest {
    private val name = "Selam Foreign Employment Agent PLC"
    private val licence = "MoLS/123/2024"

    @Test fun `matches by normalised name`() = assertTrue(AgencyMatcher.matches("selam employment agency", name, licence))
    @Test fun `matches by licence ignoring case`() = assertTrue(AgencyMatcher.matches("mols/123/2024", name, licence))
    @Test fun `does not match other names or tiny queries`() {
        assertFalse(AgencyMatcher.matches("Selamta", name, licence))
        assertFalse(AgencyMatcher.matches("PLC", name, licence))
    }
}
