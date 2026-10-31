package org.recitelabs.dadalink.feature.assistant.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import kotlinx.serialization.Serializable
import org.recitelabs.dadalink.feature.assistant.AskDestination

/** [question] pre-fills and sends a first question; [voice] opens speech input immediately. */
@Serializable data class AskRoute(val question: String? = null, val voice: Boolean = false)

fun NavController.navigateToAsk(question: String? = null, voice: Boolean = false) =
    navigate(AskRoute(question, voice)) { launchSingleTop = true }

fun NavGraphBuilder.askScreen(onBack: (() -> Unit)?, onSos: () -> Unit) {
    composable<AskRoute> { AskDestination(onBack = onBack, onSos = onSos) }
}
