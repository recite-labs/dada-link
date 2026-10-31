package org.recitelabs.dadalink.core.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.recitelabs.dadalink.core.designsystem.theme.LightDadaColors
import org.recitelabs.dadalink.core.designsystem.theme.MIN_TEXT_SIZE_SP
import org.recitelabs.dadalink.core.designsystem.theme.MinTouchTarget
import org.recitelabs.dadalink.core.designsystem.theme.Script
import org.recitelabs.dadalink.core.designsystem.theme.dadaTypography

/** Guards the Paper "dadalink" tokens against accidental drift. */
class ThemeTokensTest {
    private fun hex(color: Color) = "#%06X".format(color.toArgb() and 0xFFFFFF)

    @Test fun `colour tokens match the design file`() {
        with(LightDadaColors) {
            assertEquals("#FFFFFF", hex(ground))
            assertEquals("#F5F4FA", hex(surface))
            assertEquals("#E4E2EF", hex(line))
            assertEquals("#17142B", hex(ink))
            assertEquals("#5E5A73", hex(muted))
            assertEquals("#3B2F8F", hex(primary))
            assertEquals("#261D63", hex(primaryDeep))
            assertEquals("#ECEAF7", hex(tint))
            assertEquals("#F2A93B", hex(accent))
            assertEquals("#D7263D", hex(sos))
            assertEquals("#2E7D5B", hex(safe))
        }
    }

    @Test fun `no text style is smaller than 13sp in either script`() {
        Script.entries.forEach { script ->
            dadaTypography(script).all.forEach { style ->
                assertTrue("$script ${style.fontSize}", style.fontSize.value >= MIN_TEXT_SIZE_SP)
            }
        }
    }

    @Test fun `headings are heavy and body is 15 to 16sp`() {
        val type = dadaTypography()
        assertEquals(FontWeight.ExtraBold, type.display.fontWeight)
        assertEquals(34f, type.display.fontSize.value)
        assertEquals(FontWeight.ExtraBold, type.headline.fontWeight)
        assertTrue(type.body.fontSize.value in 15f..16f)
        assertTrue(type.bodySmall.fontSize.value in 15f..16f)
    }

    @Test fun `touch targets are at least 48dp`() = assertTrue(MinTouchTarget.value >= 48f)
}
