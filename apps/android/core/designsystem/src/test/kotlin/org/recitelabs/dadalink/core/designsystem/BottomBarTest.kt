package org.recitelabs.dadalink.core.designsystem

import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.designsystem.component.BottomBarItem
import org.recitelabs.dadalink.core.designsystem.component.DadaBottomBar
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class BottomBarTest {
    @get:Rule val compose = createComposeRule()

    @Test fun `sos button and tabs dispatch their actions`() {
        var sos = 0
        var selected: String? = null
        val items = listOf(
            BottomBarItem("home", "Home", DadaIcons.Home),
            BottomBarItem("ask", "Ask", DadaIcons.Ask),
            BottomBarItem("help", "Help", DadaIcons.Help),
            BottomBarItem("more", "More", DadaIcons.More),
        )
        compose.setContent {
            DadaTheme {
                DadaBottomBar(items, selectedKey = "home", onSelect = { selected = it.key }, sosLabel = "Send SOS", onSos = { sos++ })
            }
        }

        compose.onNodeWithText("Home").assertIsSelected()
        compose.onNodeWithContentDescription("Send SOS").performClick()
        compose.onNodeWithText("Help").performClick()

        assertEquals(1, sos)
        assertEquals("help", selected)
    }
}
