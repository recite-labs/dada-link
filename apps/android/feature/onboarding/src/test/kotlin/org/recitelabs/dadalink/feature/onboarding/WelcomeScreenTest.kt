package org.recitelabs.dadalink.feature.onboarding

import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.feature.onboarding.welcome.WelcomeScreen
import org.recitelabs.dadalink.feature.onboarding.welcome.WelcomeUiState
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class WelcomeScreenTest {
    @get:Rule val compose = createComposeRule()

    @Test fun `shows endonyms, swahili is not selectable yet`() {
        var picked: AppLanguage? = null
        var started = false
        compose.setContent {
            DadaTheme { WelcomeScreen(WelcomeUiState(selected = AppLanguage.ENGLISH), { picked = it }, { started = true }) }
        }

        compose.onNodeWithText("English").assertIsSelected()
        compose.onNodeWithText("Kiswahili").performScrollTo().assertIsNotEnabled()
        compose.onNodeWithText("አማርኛ").performScrollTo().performClick()
        compose.onNodeWithText("Get started").performClick()

        assertEquals(AppLanguage.AMHARIC, picked)
        assertEquals(true, started)
    }
}
