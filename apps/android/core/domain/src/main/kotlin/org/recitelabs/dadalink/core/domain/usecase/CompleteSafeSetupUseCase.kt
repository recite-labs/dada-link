package org.recitelabs.dadalink.core.domain.usecase

import org.recitelabs.dadalink.core.domain.repository.DisguiseController
import org.recitelabs.dadalink.core.domain.repository.PinRepository
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.domain.safety.PinPolicy
import org.recitelabs.dadalink.core.domain.safety.TrustedContactValidator
import org.recitelabs.dadalink.core.model.DisguiseMode
import org.recitelabs.dadalink.core.model.TrustedContact
import javax.inject.Inject

data class SafeSetup(
    val nickname: String?,
    val pin: String,
    val disguise: DisguiseMode,
    /** Optional: the user may skip and add a contact later. */
    val trustedContact: TrustedContact?,
    val hideNotificationContent: Boolean,
)

sealed interface SafeSetupResult {
    data object Saved : SafeSetupResult
    data class Invalid(
        val pin: PinPolicy.Verdict,
        val contactProblems: Set<TrustedContactValidator.Problem>,
    ) : SafeSetupResult
}

/** Validates and persists the "Safe setup" step, then applies the launcher disguise. */
class CompleteSafeSetupUseCase @Inject constructor(
    private val settings: SettingsRepository,
    private val pins: PinRepository,
    private val disguise: DisguiseController,
) {
    suspend operator fun invoke(setup: SafeSetup): SafeSetupResult {
        val pinVerdict = PinPolicy.check(setup.pin)
        val contact = setup.trustedContact?.normalized()
        val contactProblems = contact?.let(TrustedContactValidator::problems).orEmpty()
        if (pinVerdict != PinPolicy.Verdict.VALID || contactProblems.isNotEmpty()) {
            return SafeSetupResult.Invalid(pinVerdict, contactProblems)
        }
        pins.setPin(setup.pin)
        settings.setNickname(setup.nickname?.trim()?.takeIf { it.isNotEmpty() })
        settings.setTrustedContact(contact)
        settings.setHideNotificationContent(setup.hideNotificationContent)
        settings.setDisguise(setup.disguise)
        settings.markOnboarded()
        disguise.apply(setup.disguise)
        return SafeSetupResult.Saved
    }

    private fun TrustedContact.normalized() = TrustedContact(
        name = name.trim(),
        relation = relation.trim(),
        phone = phone?.takeIf { it.isNotBlank() }?.let(TrustedContactValidator::normalizePhone),
        telegram = telegram?.takeIf { it.isNotBlank() }?.let(TrustedContactValidator::normalizeTelegram),
    )
}
