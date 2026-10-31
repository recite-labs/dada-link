package org.recitelabs.dadalink.core.domain.usecase

import org.recitelabs.dadalink.core.domain.repository.DisguiseController
import org.recitelabs.dadalink.core.domain.repository.SettingsRepository
import org.recitelabs.dadalink.core.model.DisguiseMode
import javax.inject.Inject

class UpdateDisguiseUseCase @Inject constructor(
    private val settings: SettingsRepository,
    private val controller: DisguiseController,
) {
    suspend operator fun invoke(mode: DisguiseMode) {
        settings.setDisguise(mode)
        controller.apply(mode)
    }
}
