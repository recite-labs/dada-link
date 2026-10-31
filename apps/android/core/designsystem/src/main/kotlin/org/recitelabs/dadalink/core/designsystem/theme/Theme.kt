package org.recitelabs.dadalink.core.designsystem.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember

/**
 * DadaLink theme. Light only by design: the palette was tuned for bright, glanceable screens and a
 * dark UI would make the SOS red and the safe green harder to tell apart on cheap panels.
 */
@Composable
fun DadaTheme(
    script: Script = Script.Latin,
    content: @Composable () -> Unit,
) {
    val colors = LightDadaColors
    val typography = remember(script) { dadaTypography(script) }
    val materialColors = lightColorScheme(
        primary = colors.primary,
        onPrimary = colors.onPrimary,
        primaryContainer = colors.tint,
        onPrimaryContainer = colors.primaryDeep,
        secondary = colors.primaryDeep,
        onSecondary = colors.onPrimary,
        tertiary = colors.accent,
        onTertiary = colors.ink,
        background = colors.ground,
        onBackground = colors.ink,
        surface = colors.ground,
        onSurface = colors.ink,
        surfaceVariant = colors.surface,
        onSurfaceVariant = colors.muted,
        surfaceContainerLowest = colors.ground,
        surfaceContainerLow = colors.surface,
        surfaceContainer = colors.surface,
        surfaceContainerHigh = colors.tint,
        outline = colors.line,
        outlineVariant = colors.line,
        error = colors.sos,
        onError = colors.onSos,
        errorContainer = colors.sosTint,
        onErrorContainer = colors.sos,
    )
    val materialTypography = Typography(
        displaySmall = typography.display,
        headlineMedium = typography.headline,
        headlineSmall = typography.headline,
        titleLarge = typography.title,
        titleMedium = typography.titleSmall,
        titleSmall = typography.label,
        bodyLarge = typography.body,
        bodyMedium = typography.bodySmall,
        bodySmall = typography.caption,
        labelLarge = typography.label,
        labelMedium = typography.caption,
        labelSmall = typography.caption,
    )
    CompositionLocalProvider(
        LocalDadaColors provides colors,
        LocalDadaTypography provides typography,
        LocalDadaShapes provides DadaShapes(),
        LocalDadaSpacing provides DadaSpacing(),
    ) {
        MaterialTheme(colorScheme = materialColors, typography = materialTypography, content = content)
    }
}

/** Accessors for the current theme values, mirroring `MaterialTheme`. */
object DadaTheme {
    val colors: DadaColors
        @Composable @ReadOnlyComposable get() = LocalDadaColors.current
    val typography: DadaTypography
        @Composable @ReadOnlyComposable get() = LocalDadaTypography.current
    val shapes: DadaShapes
        @Composable @ReadOnlyComposable get() = LocalDadaShapes.current
    val spacing: DadaSpacing
        @Composable @ReadOnlyComposable get() = LocalDadaSpacing.current
}
