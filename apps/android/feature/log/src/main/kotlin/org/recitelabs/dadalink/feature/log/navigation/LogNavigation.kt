package org.recitelabs.dadalink.feature.log.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.feature.log.add.AddLogEntryDestination
import org.recitelabs.dadalink.feature.log.list.LogDestination

@Serializable data object LogRoute

@Serializable data object AddLogEntryRoute

fun NavController.navigateToLog() = navigate(LogRoute) { launchSingleTop = true }

fun NavGraphBuilder.logScreens(navController: NavController) {
    composable<LogRoute> { LogDestination(onBack = navController::popBackStack, onAdd = { navController.navigate(AddLogEntryRoute) }) }
    composable<AddLogEntryRoute> { AddLogEntryDestination(onDone = navController::popBackStack) }
}
