package org.recitelabs.dadalink.feature.sos.navigation

import androidx.annotation.Keep
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.core.model.SosChannelResult
import org.recitelabs.dadalink.feature.sos.SosDestination
import org.recitelabs.dadalink.feature.sos.SosSentDestination

@Serializable data object SosRoute

@Keep // serialised into a navigation route
enum class ChannelStatus {
    SENT, QUEUED, OPENED, FAILED;

    val isPositive: Boolean get() = this != FAILED
}

/** Only non-sensitive summary data travels in the route (no message text, no location). */
@Serializable
data class SosSentRoute(
    val contactName: String,
    val sms: ChannelStatus,
    val relay: ChannelStatus,
    val emergencyNumber: String,
    val embassyNumber: String? = null,
)

internal fun SosChannelResult?.toArg(openedFallback: Boolean): ChannelStatus = when {
    this is SosChannelResult.Sent -> ChannelStatus.SENT
    this is SosChannelResult.Queued -> ChannelStatus.QUEUED
    openedFallback -> ChannelStatus.OPENED
    else -> ChannelStatus.FAILED
}

fun NavController.navigateToSos() = navigate(SosRoute) { launchSingleTop = true }

fun NavGraphBuilder.sosScreens(navController: NavController, onAddContact: () -> Unit, onSafe: () -> Unit) {
    composable<SosRoute> {
        SosDestination(
            onBack = navController::popBackStack,
            onSent = { navController.navigate(it) { popUpTo<SosRoute> { inclusive = true } } },
            onAddContact = onAddContact,
        )
    }
    composable<SosSentRoute> { entry ->
        SosSentDestination(
            args = entry.toRoute(),
            onSendAgain = { navController.navigate(SosRoute) { popUpTo<SosSentRoute> { inclusive = true } } },
            onSafe = onSafe,
        )
    }
}
