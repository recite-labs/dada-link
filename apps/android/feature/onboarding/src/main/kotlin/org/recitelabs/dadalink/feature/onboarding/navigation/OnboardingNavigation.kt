package org.recitelabs.dadalink.feature.onboarding.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.feature.onboarding.settings.SafetySettingsDestination
import org.recitelabs.dadalink.feature.onboarding.setup.SafeSetupDestination
import org.recitelabs.dadalink.feature.onboarding.welcome.WelcomeDestination

@Serializable data object WelcomeRoute

@Serializable data object SafeSetupRoute

@Serializable data object SafetySettingsRoute

fun NavController.navigateToSafeSetup() = navigate(SafeSetupRoute)

fun NavGraphBuilder.onboardingScreens(navController: NavController, onComplete: () -> Unit) {
    composable<WelcomeRoute> { WelcomeDestination(onGetStarted = navController::navigateToSafeSetup) }
    composable<SafeSetupRoute> { SafeSetupDestination(onBack = navController::popBackStack, onComplete = onComplete) }
}

fun NavController.navigateToSafetySettings() = navigate(SafetySettingsRoute) { launchSingleTop = true }

fun NavGraphBuilder.safetySettingsScreen(navController: NavController) {
    composable<SafetySettingsRoute> { SafetySettingsDestination(onBack = navController::popBackStack) }
}
