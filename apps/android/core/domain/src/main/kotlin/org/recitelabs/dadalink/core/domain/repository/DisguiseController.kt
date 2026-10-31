package org.recitelabs.dadalink.core.domain.repository

import org.recitelabs.dadalink.core.model.DisguiseMode

/** Switches the launcher entry (name + icon) the app appears under. */
interface DisguiseController {
    fun apply(mode: DisguiseMode)
}
