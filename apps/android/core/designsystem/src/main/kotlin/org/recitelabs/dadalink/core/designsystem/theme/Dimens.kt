package org.recitelabs.dadalink.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/** Minimum touch target (accessibility; many users have cracked screens and use gloves). */
val MinTouchTarget: Dp = 48.dp

@Immutable
data class DadaSpacing(
    val xxs: Dp = 4.dp,
    val xs: Dp = 8.dp,
    val sm: Dp = 12.dp,
    val md: Dp = 16.dp,
    val lg: Dp = 20.dp,
    val xl: Dp = 24.dp,
    val xxl: Dp = 32.dp,
    /** Horizontal padding of screen content. */
    val screen: Dp = 20.dp,
)

val LocalDadaSpacing = staticCompositionLocalOf { DadaSpacing() }
