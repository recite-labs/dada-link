package org.recitelabs.dadalink.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import org.recitelabs.dadalink.MainUiState
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.feature.disguise.LockGate
import org.recitelabs.dadalink.feature.onboarding.navigation.WelcomeRoute
import org.recitelabs.dadalink.feature.onboarding.navigation.onboardingScreens

/**
 * Top-level gate:
 *  - not onboarded → welcome + safe setup;
 *  - locked → the chosen disguise (calculator / notes) or the PIN screen;
 *  - unlocked → the app. Re-locking drops the whole navigation state on purpose.
 */
@Composable
fun DadaLinkApp(state: MainUiState) {
    when (state) {
        MainUiState.Loading -> Box(Modifier.fillMaxSize().background(DadaTheme.colors.ground))
        is MainUiState.Ready -> when {
            !state.settings.isOnboarded -> OnboardingFlow()
            !state.isUnlocked -> LockGate(state.settings.disguise)
            else -> MainApp()
        }
    }
}

@Composable
private fun OnboardingFlow() {
    val navController = rememberNavController()
    // Completion flips settings.isOnboarded + unlocks the session; DadaLinkApp then shows MainApp.
    NavHost(navController = navController, startDestination = WelcomeRoute) {
        onboardingScreens(navController, onComplete = {})
    }
}
