package org.recitelabs.dadalink.core.domain.safety

/** Rules for the 4-digit app PIN. */
object PinPolicy {
    const val LENGTH = 4

    enum class Verdict { VALID, WRONG_LENGTH, NOT_DIGITS, TOO_SIMPLE }

    private val trivial = setOf("1234", "4321", "0123", "3210", "1212", "2580", "0852")

    fun check(pin: String): Verdict = when {
        pin.length != LENGTH -> Verdict.WRONG_LENGTH
        !pin.all { it in '0'..'9' } -> Verdict.NOT_DIGITS
        pin.toSet().size == 1 || pin in trivial -> Verdict.TOO_SIMPLE
        else -> Verdict.VALID
    }
}
