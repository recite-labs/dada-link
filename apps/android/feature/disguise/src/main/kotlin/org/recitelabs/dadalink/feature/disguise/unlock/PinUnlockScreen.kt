package org.recitelabs.dadalink.feature.disguise.unlock

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaLogoMark
import org.recitelabs.dadalink.core.designsystem.component.NumberPad
import org.recitelabs.dadalink.core.designsystem.component.PinDots
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.SecureScreen
import org.recitelabs.dadalink.feature.disguise.R

@Composable
fun PinUnlockDestination(viewModel: PinUnlockViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    PinUnlockScreen(state, viewModel::onDigit, viewModel::onDelete)
}

@Composable
fun PinUnlockScreen(state: PinUnlockUiState, onDigit: (Char) -> Unit, onDelete: () -> Unit, modifier: Modifier = Modifier) {
    SecureScreen()
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DadaTheme.colors.ground)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = 32.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Spacer(Modifier.weight(1f))
        DadaLogoMark(size = 56.dp)
        Text(stringResource(R.string.disguise_unlock_title), style = DadaTheme.typography.headline, color = DadaTheme.colors.ink)
        PinDots(
            filled = state.entered.length,
            length = 4,
            isError = state.isWrong,
            description = stringResource(R.string.disguise_pin_dots, state.entered.length),
        )
        val message = when {
            state.lockoutSeconds > 0 -> pluralStringResource(R.plurals.disguise_unlock_wait, state.lockoutSeconds, state.lockoutSeconds)
            state.isWrong -> stringResource(R.string.disguise_unlock_wrong)
            else -> " "
        }
        Text(message, style = DadaTheme.typography.label, color = DadaTheme.colors.sos)
        Spacer(Modifier.height(8.dp))
        NumberPad(onDigit = onDigit, onDelete = onDelete, deleteContentDescription = stringResource(R.string.disguise_delete))
    }
}

@PhonePreviews
@Composable
private fun PinUnlockPreview() = DadaTheme { PinUnlockScreen(PinUnlockUiState(entered = "20"), {}, {}) }
