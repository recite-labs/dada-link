package org.recitelabs.dadalink.core.domain.safety

import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.testing.TestData
import java.time.Instant

class SosMessageFormatterTest {
    private val labels = SosMessageLabels(location = "Location", time = "Time", locationUnknown = "unknown")
    private val at = Instant.parse("2026-10-31T11:32:00Z")

    @Test fun `includes map link accuracy and utc time`() {
        val text = SosMessageFormatter.format("Meron needs help.", TestData.riyadh, at, labels)
        assertEquals(
            "Meron needs help.\nLocation: https://maps.google.com/?q=24.71360,46.67530 (±18 m)\nTime: 31 Oct 11:32 UTC",
            text,
        )
    }

    @Test fun `says unknown when there is no location`() {
        val text = SosMessageFormatter.format("Help", null, at, labels)
        assertEquals("Help\nLocation: unknown\nTime: 31 Oct 11:32 UTC", text)
    }
}
