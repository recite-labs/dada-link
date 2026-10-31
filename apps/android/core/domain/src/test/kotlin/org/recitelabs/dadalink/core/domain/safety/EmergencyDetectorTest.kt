package org.recitelabs.dadalink.core.domain.safety

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class EmergencyDetectorTest {
    private val detector = EmergencyDetector()

    @Test fun `detects english danger phrases case-insensitively`() {
        assertTrue(detector.isEmergency("My madam BEAT ME yesterday"))
        assertTrue(detector.isEmergency("they locked me in the room"))
    }

    @Test fun `detects amharic and oromo`() {
        assertTrue(detector.isEmergency("አሰሪዬ ደበደበኝ"))
        assertTrue(detector.isEmergency("Abbaan manaa na reebe"))
    }

    @Test fun `ordinary questions are not emergencies`() {
        assertFalse(detector.isEmergency("When should I get my salary?"))
        assertFalse(detector.isEmergency("ደሞዜ መቼ ይከፈላል?"))
    }
}
