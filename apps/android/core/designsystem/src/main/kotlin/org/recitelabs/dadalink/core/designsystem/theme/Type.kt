package org.recitelabs.dadalink.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import org.recitelabs.dadalink.core.designsystem.R

/** Writing system of the active UI language; selects the bundled font family. */
enum class Script { Latin, Ethiopic }

val InterFontFamily = FontFamily(
    Font(R.font.inter_regular, FontWeight.Normal),
    Font(R.font.inter_medium, FontWeight.Medium),
    Font(R.font.inter_semibold, FontWeight.SemiBold),
    Font(R.font.inter_bold, FontWeight.Bold),
    Font(R.font.inter_extrabold, FontWeight.ExtraBold),
)

val NotoSansEthiopicFontFamily = FontFamily(
    Font(R.font.noto_sans_ethiopic_regular, FontWeight.Normal),
    Font(R.font.noto_sans_ethiopic_medium, FontWeight.Medium),
    Font(R.font.noto_sans_ethiopic_semibold, FontWeight.SemiBold),
    Font(R.font.noto_sans_ethiopic_bold, FontWeight.Bold),
    Font(R.font.noto_sans_ethiopic_extrabold, FontWeight.ExtraBold),
)

fun fontFamilyFor(script: Script): FontFamily = when (script) {
    Script.Latin -> InterFontFamily
    Script.Ethiopic -> NotoSansEthiopicFontFamily
}

/** Smallest text size allowed anywhere in the app (readability for low-literacy users). */
const val MIN_TEXT_SIZE_SP = 13f

/**
 * Type scale. Headings are weight 800 with tight tracking; body copy is 15–16sp. Ge'ez glyphs are
 * taller, so the Ethiopic variant relaxes tracking and adds line height.
 */
@Immutable
data class DadaTypography(
    val display: TextStyle,
    val headline: TextStyle,
    val title: TextStyle,
    val titleSmall: TextStyle,
    val body: TextStyle,
    val bodySmall: TextStyle,
    val label: TextStyle,
    val caption: TextStyle,
) {
    val all: List<TextStyle> get() = listOf(display, headline, title, titleSmall, body, bodySmall, label, caption)
}

fun dadaTypography(script: Script = Script.Latin): DadaTypography {
    val family = fontFamilyFor(script)
    val ethiopic = script == Script.Ethiopic
    val tight = if (ethiopic) 0.em else (-0.03).em
    val lineBoost = if (ethiopic) 1.12f else 1f
    fun style(size: Float, weight: FontWeight, line: Float, tracking: androidx.compose.ui.unit.TextUnit = 0.em) =
        TextStyle(
            fontFamily = family,
            fontWeight = weight,
            fontSize = size.sp,
            lineHeight = (line * lineBoost).sp,
            letterSpacing = tracking,
        )
    return DadaTypography(
        display = style(34f, FontWeight.ExtraBold, 38f, tight),
        headline = style(26f, FontWeight.ExtraBold, 30f, tight),
        title = style(20f, FontWeight.ExtraBold, 25f, if (ethiopic) 0.em else (-0.02).em),
        titleSmall = style(16f, FontWeight.Bold, 21f, if (ethiopic) 0.em else (-0.01).em),
        body = style(16f, FontWeight.Normal, 23f),
        bodySmall = style(15f, FontWeight.Normal, 21f),
        label = style(15f, FontWeight.SemiBold, 19f),
        caption = style(MIN_TEXT_SIZE_SP, FontWeight.Medium, 17f),
    )
}

val LocalDadaTypography = staticCompositionLocalOf { dadaTypography() }
