package org.recitelabs.dadalink.feature.help

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaButtonStyle
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaChip
import org.recitelabs.dadalink.core.designsystem.component.SectionHeader
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.Country
import org.recitelabs.dadalink.core.model.HelpContact
import org.recitelabs.dadalink.core.model.HelpDirectory
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.copyToClipboard
import org.recitelabs.dadalink.core.ui.dial
import org.recitelabs.dadalink.core.ui.localizedName
import org.recitelabs.dadalink.core.ui.R as CoreUiR

@Composable
internal fun HelpDestination(onBack: (() -> Unit)?, viewModel: HelpViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val copiedLabel = stringResource(CoreUiR.string.core_ui_copied)
    HelpScreen(
        state = state,
        onBack = onBack,
        onSelectCountry = viewModel::selectCountry,
        onCall = { context.dial(it) },
        onCopy = { context.copyToClipboard(copiedLabel, it) },
    )
}

/** 03 Help numbers: per-country directory, bundled, works offline. */
@Composable
fun HelpScreen(
    state: HelpUiState,
    onBack: (() -> Unit)?,
    onSelectCountry: (Country) -> Unit,
    onCall: (String) -> Unit,
    onCopy: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    DadaScreen(title = stringResource(R.string.help_title), onBack = onBack, modifier = modifier) {
        val ready = state as? HelpUiState.Ready ?: return@DadaScreen
        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = DadaTheme.spacing.screen, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            ready.countries.forEach { country ->
                DadaChip(text = country.localizedName(), selected = country == ready.country, onClick = { onSelectCountry(country) })
            }
        }
        val directory = ready.directory
        if (directory == null) {
            Text(
                stringResource(R.string.help_no_directory),
                style = DadaTheme.typography.body,
                color = DadaTheme.colors.muted,
                modifier = Modifier.padding(DadaTheme.spacing.screen),
            )
            return@DadaScreen
        }
        DirectoryList(directory, onCall, onCopy)
    }
}

@Composable
private fun DirectoryList(directory: HelpDirectory, onCall: (String) -> Unit, onCopy: (String) -> Unit) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(DadaTheme.spacing.screen),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item { EmergencyCard(directory.emergency, onCall) }
        directory.sections.forEach { section ->
            item(key = "h-" + section.title) { SectionHeader(section.title, Modifier.padding(top = 8.dp)) }
            items(section.contacts, key = { it.id }) { contact -> ContactRow(contact, onCall, onCopy) }
        }
        item {
            Spacer(Modifier.height(8.dp))
            directory.lastReviewed?.let {
                Text(stringResource(R.string.help_last_checked, it), style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
            }
            Text(stringResource(R.string.help_unverified_note), style = DadaTheme.typography.caption, color = DadaTheme.colors.muted)
        }
    }
}

@Composable
private fun EmergencyCard(contact: HelpContact, onCall: (String) -> Unit) {
    val colors = DadaTheme.colors
    DadaCard(
        modifier = Modifier.fillMaxWidth(),
        containerColor = colors.sosTint,
        border = BorderStroke(1.dp, colors.sos.copy(alpha = 0.25f)),
        shape = DadaTheme.shapes.cardLarge,
        contentPadding = 20.dp,
    ) {
        Text(stringResource(R.string.help_emergency).uppercase(), style = DadaTheme.typography.caption, color = colors.sos)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(contact.phone.orEmpty(), style = DadaTheme.typography.display, color = colors.sos)
                Text(contact.name, style = DadaTheme.typography.titleSmall, color = colors.ink)
                Text(contact.description, style = DadaTheme.typography.caption, color = colors.muted)
            }
            contact.phone?.let { number ->
                DadaButton(
                    text = stringResource(CoreUiR.string.core_ui_call),
                    onClick = { onCall(number) },
                    style = DadaButtonStyle.Danger,
                    leadingIcon = DadaIcons.Call,
                )
            }
        }
    }
}

@Composable
private fun ContactRow(contact: HelpContact, onCall: (String) -> Unit, onCopy: (String) -> Unit) {
    val colors = DadaTheme.colors
    DadaCard(modifier = Modifier.fillMaxWidth(), containerColor = colors.ground, border = BorderStroke(1.dp, colors.line), contentPadding = 14.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Column(Modifier.weight(1f)) {
                Text(contact.name, style = DadaTheme.typography.titleSmall, color = colors.ink)
                Text(contact.description, style = DadaTheme.typography.caption, color = colors.muted)
                val number = contact.phone
                Text(
                    text = number ?: stringResource(CoreUiR.string.core_ui_number_pending),
                    style = if (number != null) DadaTheme.typography.label else DadaTheme.typography.caption,
                    color = if (number != null) colors.primary else colors.muted,
                    modifier = Modifier.padding(top = 4.dp),
                )
                if (number != null && !contact.verified) {
                    Text(stringResource(CoreUiR.string.core_ui_unverified), style = DadaTheme.typography.caption, color = colors.muted)
                }
            }
            contact.phone?.let { number ->
                IconButton(onClick = { onCopy(number) }) {
                    Icon(DadaIcons.Copy, contentDescription = stringResource(R.string.help_copy_number, number), tint = colors.muted)
                }
                FilledTonalIconButton(
                    onClick = { onCall(number) },
                    colors = IconButtonDefaults.filledTonalIconButtonColors(containerColor = colors.tint, contentColor = colors.primary),
                ) {
                    Icon(DadaIcons.Call, contentDescription = stringResource(R.string.help_call_number, number))
                }
            }
        }
    }
}

@PhonePreviews
@Composable
private fun HelpPreview() = DadaTheme {
    HelpScreen(
        state = HelpUiState.Ready(
            Country.SAUDI_ARABIA,
            listOf(Country.SAUDI_ARABIA, Country.UAE, Country.LEBANON),
            HelpDirectory(
                Country.SAUDI_ARABIA,
                HelpContact("emergency", "Emergency — police, ambulance, fire", "Free, 24 hours", "911", "24/7", true),
                listOf(
                    org.recitelabs.dadalink.core.model.HelpSection(
                        "Ethiopian embassy",
                        listOf(HelpContact("embassy-riyadh", "Ethiopian Embassy, Riyadh", "Passport, documents", null, null, false)),
                    ),
                ),
                "2026-10",
            ),
        ),
        onBack = {}, onSelectCountry = {}, onCall = {}, onCopy = {},
    )
}
