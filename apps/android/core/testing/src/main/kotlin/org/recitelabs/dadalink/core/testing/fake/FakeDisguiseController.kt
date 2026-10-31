package org.recitelabs.dadalink.core.testing.fake

import org.recitelabs.dadalink.core.domain.repository.DisguiseController
import org.recitelabs.dadalink.core.model.DisguiseMode

class FakeDisguiseController : DisguiseController {
    val applied = mutableListOf<DisguiseMode>()
    override fun apply(mode: DisguiseMode) { applied += mode }
}
