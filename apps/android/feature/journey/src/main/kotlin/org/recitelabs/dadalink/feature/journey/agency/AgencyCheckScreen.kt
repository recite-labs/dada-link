package org.recitelabs.dadalink.feature.journey.agency

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaTextButton
import org.recitelabs.dadalink.core.designsystem.component.DadaTextField
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.Agency
import org.recitelabs.dadalink.core.model.AgencyCheckResult
import org.recitelabs.dadalink.core.model.AgencyStatus
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.journey.R

@Composable
internal fun AgencyCheckDestination(onBack: () -> Unit, onAsk: (String) -> Unit, viewModel: AgencyCheckViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AgencyCheckScreen(state, viewModel::onQueryChange, viewModel::check, onBack, onAsk)
}

/** 08 Agency check. */
@Composable
fun AgencyCheckScreen(
    state: AgencyCheckUiState,
    onQueryChange: (String) -> Unit,
    onCheck: () -> Unit,
    onBack: () -> Unit,
    onAsk: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    DadaScreen(title = stringResource(R.string.journey_agency_title), onBack = onBack, modifier = modifier) {
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(horizontal = DadaTheme.spacing.screen),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(stringResource(R.string.journey_agency_intro), style = DadaTheme.typography.body, color = DadaTheme.colors.muted)
            DadaTextField(
                value = state.query,
                onValueChange = onQueryChange,
                label = stringResource(R.string.journey_agency_input),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = { onCheck() }),
            )
            DadaButton(
                stringResource(R.string.journey_agency_check),
                onClick = onCheck,
                enabled = state.query.isNotBlank() && !state.isChecking,
                leadingIcon = DadaIcons.Search,
                modifier = Modifier.fillMaxWidth(),
            )
            when (val result = state.result) {
                is AgencyCheckResult.Found -> FoundCard(result.agency)
                AgencyCheckResult.NotFound -> NotFoundCard(onAsk = { onAsk(state.query) })
                AgencyCheckResult.Offline -> NoticeCard(stringResource(R.string.journey_agency_offline))
                is AgencyCheckResult.Invalid -> NoticeCard(stringResource(R.string.journey_agency_invalid))
                null -> Unit
            }
            Text(stringResource(R.string.journey_agency_sample_note), style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
        }
    }
}

@Composable
private fun FoundCard(agency: Agency) {
    val colors = DadaTheme.colors
    if (agency.status == AgencyStatus.UNKNOWN) {
        NoticeCard(stringResource(R.string.journey_agency_unknown), title = agency.name)
        return
    }
    val ok = agency.status == AgencyStatus.LICENSED
    DadaCard(
        modifier = Modifier.fillMaxWidth(),
        containerColor = if (ok) colors.safeTint else colors.sosTint,
        border = BorderStroke(1.dp, (if (ok) colors.safe else colors.sos).copy(alpha = 0.3f)),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(if (ok) DadaIcons.CheckCircle else DadaIcons.Warning, null, tint = if (ok) colors.safe else colors.sos)
            Text(
                if (ok) stringResource(R.string.journey_agency_found) else stringResource(R.string.journey_agency_suspended),
                style = DadaTheme.typography.titleSmall,
                color = if (ok) colors.safe else colors.sos,
            )
        }
        val body = agency.licenceNumber?.let { stringResource(R.string.journey_agency_found_body, agency.name, it) } ?: agency.name
        Text(body, style = DadaTheme.typography.bodySmall, color = colors.ink)
    }
}

@Composable
private fun NoticeCard(text: String, title: String? = null) {
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = colors.accentTint, border = BorderStroke(1.dp, colors.accent.copy(alpha = 0.4f))) {
        title?.let { Text(it, style = DadaTheme.typography.titleSmall, color = colors.ink) }
        Text(text, style = DadaTheme.typography.bodySmall, color = colors.ink)
    }
}

@Composable
private fun NotFoundCard(onAsk: () -> Unit) {
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = colors.accentTint, border = BorderStroke(1.dp, colors.accent.copy(alpha = 0.4f))) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(DadaIcons.Warning, null, tint = colors.ink)
            Text(stringResource(R.string.journey_agency_not_found), style = DadaTheme.typography.titleSmall, color = colors.ink)
        }
        Text(stringResource(R.string.journey_agency_not_found_body), style = DadaTheme.typography.bodySmall, color = colors.ink)
        DadaTextButton(stringResource(R.string.journey_ask_about), onClick = onAsk)
    }
}

@PhonePreviews
@Composable
private fun AgencyPreview() = DadaTheme {
    AgencyCheckScreen(AgencyCheckUiState(query = "Selam Agency", result = AgencyCheckResult.NotFound), {}, {}, {}, {})
}
