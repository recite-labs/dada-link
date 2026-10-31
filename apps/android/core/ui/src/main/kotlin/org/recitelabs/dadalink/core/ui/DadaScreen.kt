package org.recitelabs.dadalink.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import org.recitelabs.dadalink.core.designsystem.component.DadaTopBar
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme

/**
 * Standard secondary screen: top bar with back + title + Hide pill, then content.
 * [secure] applies FLAG_SECURE for screens with private data.
 */
@Composable
fun DadaScreen(
    title: String,
    onBack: (() -> Unit)?,
    modifier: Modifier = Modifier,
    secure: Boolean = false,
    showHide: Boolean = true,
    content: @Composable ColumnScope.() -> Unit,
) {
    if (secure) SecureScreen()
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DadaTheme.colors.ground)
            .statusBarsPadding(),
    ) {
        DadaTopBar(
            title = title,
            onBack = onBack,
            backContentDescription = stringResource(R.string.core_ui_back),
            actions = { if (showHide) HideButton() },
        )
        content()
    }
}
