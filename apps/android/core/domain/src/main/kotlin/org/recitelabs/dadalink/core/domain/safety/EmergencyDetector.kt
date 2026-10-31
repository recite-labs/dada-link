package org.recitelabs.dadalink.core.domain.safety

import javax.inject.Inject

/**
 * Conservative on-device check for messages that suggest immediate danger. It never blocks the
 * conversation; it only makes the UI lead with SOS and emergency numbers. False positives are
 * acceptable, false negatives are not — the server runs its own, stronger classifier.
 */
class EmergencyDetector @Inject constructor() {

    fun isEmergency(text: String): Boolean {
        val normalized = text.lowercase()
        return phrases.any { it in normalized }
    }

    private companion object {
        val phrases = listOf(
            // English
            "kill me", "going to kill", "wants to kill", "beat me", "beating me", "hit me", "hitting me",
            "rape", "raped", "locked me", "locked in", "lock me", "can't breathe", "cannot breathe",
            "suicide", "kill myself", "end my life", "want to die", "hurt myself", "attacking me",
            "bleeding", "help me now", "emergency",
            // Amharic
            "ሊገድለኝ", "ሊገድሉኝ", "ደበደበኝ", "ደበደቡኝ", "ይደበድበኛል", "ይደበድቡኛል", "ተደፈርኩ", "ደፈረኝ",
            "ቆለፈብኝ", "ቆልፈውብኛል", "ራሴን ላጠፋ", "መሞት እፈልጋለሁ", "እየደማሁ", "አድኑኝ",
            // Afaan Oromoo
            "na ajjeesuu", "na rukute", "na reebe", "na reebu", "na gudeede", "of ajjeesuu",
            "du'uun barbaada", "na cufan", "na gargaaraa",
        )
    }
}
