package org.recitelabs.dadalink.feature.help.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.feature.help.HelpDestination

@Serializable data object HelpRoute

/** Help is a top-level tab, so it has no back button. */
fun NavGraphBuilder.helpScreen() {
    composable<HelpRoute> { HelpDestination(onBack = null) }
}
