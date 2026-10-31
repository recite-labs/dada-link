package org.recitelabs.dadalink.feature.health.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.feature.health.HealthDestination

@Serializable data object HealthRoute

fun NavGraphBuilder.healthScreen(navController: NavController, onAsk: (String) -> Unit, onOpenArticle: (String) -> Unit, onHelp: () -> Unit) {
    composable<HealthRoute> { HealthDestination(navController::popBackStack, onAsk, onOpenArticle, onHelp) }
}
