package org.recitelabs.dadalink.feature.onboarding.welcome

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaChoiceCard
import org.recitelabs.dadalink.core.designsystem.component.DadaWordmark
import org.recitelabs.dadalink.core.designsystem.component.IconBadge
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.designsystem.theme.NotoSansEthiopicFontFamily
import org.recitelabs.dadalink.core.model.AppLanguage
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.onboarding.R

@Composable
internal fun WelcomeDestination(onGetStarted: () -> Unit, viewModel: WelcomeViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    WelcomeScreen(state = state, onSelectLanguage = viewModel::selectLanguage, onGetStarted = onGetStarted)
}

/** 00 Welcome: language, three safety promises, Get started. */
@Composable
fun WelcomeScreen(
    state: WelcomeUiState,
    onSelectLanguage: (AppLanguage) -> Unit,
    onGetStarted: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DadaTheme.colors.ground)
            .statusBarsPadding()
            .navigationBarsPadding(),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = DadaTheme.spacing.screen),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Spacer(Modifier.height(20.dp))
            DadaWordmark(markSize = 32.dp)
            Spacer(Modifier.height(8.dp))
            Text(stringResource(R.string.onboarding_tagline), style = DadaTheme.typography.display, color = DadaTheme.colors.ink)
            Text(stringResource(R.string.onboarding_welcome_body), style = DadaTheme.typography.body, color = DadaTheme.colors.muted)
            Spacer(Modifier.height(8.dp))
            Text(stringResource(R.string.onboarding_choose_language), style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
            state.languages.forEach { language ->
                DadaChoiceCard(
                    title = language.endonym,
                    selected = language == state.selected,
                    enabled = language.isAvailable,
                    trailingLabel = if (language.isAvailable) null else stringResource(R.string.onboarding_soon),
                    onClick = { onSelectLanguage(language) },
                    titleFontFamily = if (language.isEthiopicScript) NotoSansEthiopicFontFamily else null,
                )
            }
            Spacer(Modifier.height(8.dp))
            Promise(DadaIcons.Lock, R.string.onboarding_promise_private_title, R.string.onboarding_promise_private_body)
            Promise(DadaIcons.Hide, R.string.onboarding_promise_hidden_title, R.string.onboarding_promise_hidden_body)
            Promise(DadaIcons.Shield, R.string.onboarding_promise_sos_title, R.string.onboarding_promise_sos_body)
            Spacer(Modifier.height(8.dp))
        }
        DadaButton(
            text = stringResource(R.string.onboarding_get_started),
            onClick = onGetStarted,
            modifier = Modifier
                .fillMaxWidth()
                .padding(DadaTheme.spacing.screen),
        )
    }
}

@Composable
private fun Promise(icon: ImageVector, title: Int, body: Int) {
    Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.Top) {
        IconBadge(icon)
        Column {
            Text(stringResource(title), style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
            Text(stringResource(body), style = DadaTheme.typography.bodySmall, color = DadaTheme.colors.muted)
        }
    }
}

@PhonePreviews
@Composable
private fun WelcomePreview() = DadaTheme {
    WelcomeScreen(WelcomeUiState(selected = AppLanguage.AMHARIC), {}, {})
}
