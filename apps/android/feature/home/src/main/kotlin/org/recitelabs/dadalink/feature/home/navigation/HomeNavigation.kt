package org.recitelabs.dadalink.feature.home.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.feature.home.HomeDestination
import org.recitelabs.dadalink.feature.home.HomeTarget

@Serializable data object HomeRoute

fun NavGraphBuilder.homeScreen(onAsk: (question: String?, voice: Boolean) -> Unit, onOpen: (HomeTarget) -> Unit) {
    composable<HomeRoute> { HomeDestination(onAsk = onAsk, onOpen = onOpen) }
}
