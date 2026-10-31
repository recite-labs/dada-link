package org.recitelabs.dadalink.core.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import org.recitelabs.dadalink.core.designsystem.component.HidePill

/**
 * Quick exit action provided by the host activity: locks the session, removes the task from Recents
 * and leaves the app. Features call it via [HideButton]; they never touch the Activity directly.
 */
val LocalQuickExit = staticCompositionLocalOf<() -> Unit> { {} }

/** Black "Hide" pill. One tap and the app is gone from screen and Recents. */
@Composable
fun HideButton(modifier: Modifier = Modifier) {
    val quickExit = LocalQuickExit.current
    HidePill(text = stringResource(R.string.core_ui_hide), onClick = quickExit, modifier = modifier)
}
