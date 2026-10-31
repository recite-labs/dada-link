package org.recitelabs.dadalink.core.data.platform

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import dagger.hilt.android.qualifiers.ApplicationContext
import org.recitelabs.dadalink.core.domain.repository.DisguiseController
import org.recitelabs.dadalink.core.model.DisguiseMode
import javax.inject.Inject

/**
 * Swaps the launcher entry by enabling exactly one `<activity-alias>` (declared in :app's manifest).
 * The new alias is enabled before the others are disabled so there is never zero launcher entries.
 * Note: some launchers take a few seconds to refresh, and on some devices the switch closes the app.
 */
class LauncherDisguiseController @Inject constructor(@ApplicationContext private val context: Context) : DisguiseController {

    override fun apply(mode: DisguiseMode) {
        val target = aliasFor(mode)
        val pm = context.packageManager
        setEnabled(pm, target, true)
        ALIASES.values.filter { it != target }.forEach { setEnabled(pm, it, false) }
    }

    private fun setEnabled(pm: PackageManager, alias: String, enabled: Boolean) {
        val component = ComponentName(context.packageName, alias)
        val state = if (enabled) PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
        if (pm.getComponentEnabledSetting(component) != state) {
            pm.setComponentEnabledSetting(component, state, PackageManager.DONT_KILL_APP)
        }
    }

    companion object {
        /** Must match the activity-alias names in app/src/main/AndroidManifest.xml. */
        val ALIASES = mapOf(
            DisguiseMode.NONE to "org.recitelabs.dadalink.LauncherDadaLink",
            DisguiseMode.CALCULATOR to "org.recitelabs.dadalink.LauncherCalculator",
            DisguiseMode.NOTES to "org.recitelabs.dadalink.LauncherNotes",
        )

        fun aliasFor(mode: DisguiseMode): String = ALIASES.getValue(mode)
    }
}
