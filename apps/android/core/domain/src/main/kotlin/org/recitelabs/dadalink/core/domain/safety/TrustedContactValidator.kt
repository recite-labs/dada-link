package org.recitelabs.dadalink.core.domain.safety

import org.recitelabs.dadalink.core.model.TrustedContact

object TrustedContactValidator {
    enum class Problem { NAME_MISSING, NO_CHANNEL, PHONE_INVALID, TELEGRAM_INVALID }

    private val telegramPattern = Regex("^@?[A-Za-z][A-Za-z0-9_]{4,31}$")
    private val phoneAllowed = Regex("^\\+?[0-9 ()\\-]+$")

    fun problems(contact: TrustedContact): Set<Problem> = buildSet {
        if (contact.name.isBlank()) add(Problem.NAME_MISSING)
        val phone = contact.phone?.trim().orEmpty()
        val telegram = contact.telegram?.trim().orEmpty()
        if (phone.isEmpty() && telegram.isEmpty()) add(Problem.NO_CHANNEL)
        if (phone.isNotEmpty() && !isValidPhone(phone)) add(Problem.PHONE_INVALID)
        if (telegram.isNotEmpty() && !telegramPattern.matches(telegram)) add(Problem.TELEGRAM_INVALID)
    }

    /** E.164-ish: optional +, 7–15 digits, common separators allowed. */
    fun isValidPhone(phone: String): Boolean =
        phoneAllowed.matches(phone) && phone.count { it.isDigit() } in 7..15

    /** Strips separators so the number can be dialled / sent to. */
    fun normalizePhone(phone: String): String {
        val trimmed = phone.trim()
        val digits = trimmed.filter { it.isDigit() }
        return if (trimmed.startsWith("+")) "+$digits" else digits
    }

    fun normalizeTelegram(handle: String): String = "@" + handle.trim().removePrefix("@")
}
