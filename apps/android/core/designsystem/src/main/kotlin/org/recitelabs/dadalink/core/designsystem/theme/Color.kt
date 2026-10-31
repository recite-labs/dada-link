package org.recitelabs.dadalink.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/** Raw brand tokens from the Paper "dadalink" design file. Prefer [DadaColors] in UI code. */
object DadaPalette {
    val Ground = Color(0xFFFFFFFF)
    val Surface = Color(0xFFF5F4FA)
    val Line = Color(0xFFE4E2EF)
    val Ink = Color(0xFF17142B)
    val Muted = Color(0xFF5E5A73)
    val Indigo = Color(0xFF3B2F8F)
    val IndigoDeep = Color(0xFF261D63)
    val Tint = Color(0xFFECEAF7)
    val Marigold = Color(0xFFF2A93B)
    val Sos = Color(0xFFD7263D)
    val Safe = Color(0xFF2E7D5B)

    // Derived tints (same hues at low opacity on white), used for soft status backgrounds.
    val SosTint = Color(0xFFFBE9EB)
    val SafeTint = Color(0xFFE6F2EC)
    val MarigoldTint = Color(0xFFFDF2E1)
}

/**
 * Semantic colour roles. `sos` is reserved for SOS/danger affordances only; `accent` (marigold) is
 * used sparingly for highlights.
 */
@Immutable
data class DadaColors(
    val ground: Color,
    val surface: Color,
    val line: Color,
    val ink: Color,
    val muted: Color,
    val primary: Color,
    val primaryDeep: Color,
    val onPrimary: Color,
    val tint: Color,
    val accent: Color,
    val accentTint: Color,
    val sos: Color,
    val sosTint: Color,
    val onSos: Color,
    val safe: Color,
    val safeTint: Color,
)

val LightDadaColors = DadaColors(
    ground = DadaPalette.Ground,
    surface = DadaPalette.Surface,
    line = DadaPalette.Line,
    ink = DadaPalette.Ink,
    muted = DadaPalette.Muted,
    primary = DadaPalette.Indigo,
    primaryDeep = DadaPalette.IndigoDeep,
    onPrimary = DadaPalette.Ground,
    tint = DadaPalette.Tint,
    accent = DadaPalette.Marigold,
    accentTint = DadaPalette.MarigoldTint,
    sos = DadaPalette.Sos,
    sosTint = DadaPalette.SosTint,
    onSos = DadaPalette.Ground,
    safe = DadaPalette.Safe,
    safeTint = DadaPalette.SafeTint,
)

val LocalDadaColors = staticCompositionLocalOf { LightDadaColors }
