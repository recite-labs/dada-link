package org.recitelabs.dadalink.feature.log.list

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.recitelabs.dadalink.core.designsystem.component.DadaBadge
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaCard
import org.recitelabs.dadalink.core.designsystem.component.DadaOutlinedButton
import org.recitelabs.dadalink.core.designsystem.component.DadaTextButton
import org.recitelabs.dadalink.core.designsystem.component.IconBadge
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.core.model.WagesSummary
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.core.ui.shareText
import org.recitelabs.dadalink.feature.log.R
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import org.recitelabs.dadalink.core.ui.R as CoreUiR

@Composable
internal fun LogDestination(onBack: () -> Unit, onAdd: () -> Unit, viewModel: LogViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val labels = LogExportLabels(
        header = stringResource(R.string.log_export_header, LocalDate.now().toString()),
        wage = stringResource(R.string.log_kind_wage),
        hours = stringResource(R.string.log_kind_hours),
        incident = stringResource(R.string.log_kind_incident),
        expected = stringResource(R.string.log_expected),
        received = stringResource(R.string.log_received),
        owed = stringResource(R.string.log_wages_owed),
        noRestDay = stringResource(R.string.log_no_rest),
    )
    val shareTitle = stringResource(CoreUiR.string.core_ui_share_with)
    LogScreen(
        state = state,
        onBack = onBack,
        onAdd = onAdd,
        onShare = { entries -> context.shareText(LogExport.format(entries, labels), shareTitle) },
        onDelete = viewModel::delete,
    )
}

/** 06 Private log. */
@Composable
fun LogScreen(
    state: LogUiState,
    onBack: () -> Unit,
    onAdd: () -> Unit,
    onShare: (List<LogEntry>) -> Unit,
    onDelete: (Long) -> Unit,
    modifier: Modifier = Modifier,
) {
    var confirmShare by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf<Long?>(null) }
    val ready = state as? LogUiState.Ready

    DadaScreen(title = stringResource(R.string.log_title), onBack = onBack, modifier = modifier, secure = true) {
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(horizontal = DadaTheme.spacing.screen, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            item { DadaBadge(stringResource(R.string.log_encrypted), icon = DadaIcons.Lock) }
            item { WagesCard(ready?.wages ?: WagesSummary.Empty) }
            if (ready != null && ready.entries.isEmpty()) {
                item { Text(stringResource(R.string.log_empty), style = DadaTheme.typography.body, color = DadaTheme.colors.muted) }
            }
            items(ready?.entries.orEmpty(), key = { it.id }) { entry -> EntryRow(entry, onLongPress = { confirmDelete = entry.id }) }
        }
        Row(
            modifier = Modifier.fillMaxWidth().navigationBarsPadding().padding(DadaTheme.spacing.screen),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            DadaButton(stringResource(R.string.log_add), onClick = onAdd, leadingIcon = DadaIcons.Add, modifier = Modifier.weight(1f))
            DadaOutlinedButton(
                stringResource(R.string.log_share),
                onClick = { confirmShare = true },
                enabled = !ready?.entries.isNullOrEmpty(),
                leadingIcon = DadaIcons.Share,
                modifier = Modifier.weight(1f),
            )
        }
    }

    if (confirmShare && ready != null) {
        AlertDialog(
            onDismissRequest = { confirmShare = false },
            title = { Text(stringResource(R.string.log_share_warning_title)) },
            text = { Text(stringResource(R.string.log_share_warning_body)) },
            confirmButton = { DadaTextButton(stringResource(R.string.log_share_confirm), onClick = { confirmShare = false; onShare(ready.entries) }) },
            dismissButton = { DadaTextButton(stringResource(CoreUiR.string.core_ui_cancel), onClick = { confirmShare = false }) },
        )
    }
    confirmDelete?.let { id ->
        AlertDialog(
            onDismissRequest = { confirmDelete = null },
            title = { Text(stringResource(R.string.log_delete)) },
            text = { Text(stringResource(R.string.log_delete_body)) },
            confirmButton = { DadaTextButton(stringResource(R.string.log_delete), color = DadaTheme.colors.sos, onClick = { confirmDelete = null; onDelete(id) }) },
            dismissButton = { DadaTextButton(stringResource(CoreUiR.string.core_ui_cancel), onClick = { confirmDelete = null }) },
        )
    }
}

@Composable
private fun WagesCard(wages: WagesSummary) {
    val colors = DadaTheme.colors
    DadaCard(
        modifier = Modifier.fillMaxWidth(),
        containerColor = colors.primaryDeep,
        contentColor = colors.onPrimary,
        shape = DadaTheme.shapes.cardLarge,
        contentPadding = 20.dp,
    ) {
        Text(stringResource(R.string.log_wages_owed), style = DadaTheme.typography.label, color = colors.onPrimary.copy(alpha = 0.8f))
        val owed = wages.owedByCurrency.filterValues { it > 0 }
        if (owed.isEmpty()) {
            Text(stringResource(R.string.log_wages_none), style = DadaTheme.typography.title, color = colors.onPrimary)
        } else {
            owed.forEach { (currency, amount) ->
                Text("${amount.formatted()} $currency", style = DadaTheme.typography.display, color = colors.onPrimary)
            }
            Text(stringResource(R.string.log_wages_basis), style = DadaTheme.typography.caption, color = colors.accent)
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun EntryRow(entry: LogEntry, onLongPress: () -> Unit) {
    val colors = DadaTheme.colors
    val (icon, title, detail) = when (entry) {
        is LogEntry.Wage -> Triple(
            DadaIcons.Wage,
            stringResource(R.string.log_kind_wage),
            stringResource(R.string.log_wage_line, "${entry.expected.formatted()} ${entry.currency}", "${entry.received.formatted()} ${entry.currency}"),
        )
        is LogEntry.Hours -> Triple(
            DadaIcons.Hours,
            stringResource(R.string.log_kind_hours),
            stringResource(R.string.log_hours_line, entry.hoursWorked.toString().removeSuffix(".0")) +
                if (!entry.hadRestDay) " · " + stringResource(R.string.log_no_rest) else "",
        )
        is LogEntry.Incident -> Triple(
            DadaIcons.Warning,
            stringResource(R.string.log_kind_incident),
            if (entry.photoIds.isNotEmpty()) pluralStringResource(R.plurals.log_photos, entry.photoIds.size, entry.photoIds.size) else "",
        )
    }
    DadaCard(
        modifier = Modifier.fillMaxWidth().combinedClickable(onClick = {}, onLongClick = onLongPress, onLongClickLabel = stringResource(R.string.log_delete)),
        containerColor = colors.ground,
        border = BorderStroke(1.dp, colors.line),
        contentPadding = 14.dp,
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.Top) {
            IconBadge(icon, containerColor = if (entry is LogEntry.Incident) colors.accentTint else colors.tint, contentColor = if (entry is LogEntry.Incident) colors.ink else colors.primary)
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(title, style = DadaTheme.typography.titleSmall, color = colors.ink, modifier = Modifier.weight(1f))
                    Text(entry.date.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)), style = DadaTheme.typography.caption, color = colors.muted)
                }
                if (detail.isNotBlank()) Text(detail, style = DadaTheme.typography.bodySmall, color = colors.ink)
                if (entry is LogEntry.Wage && entry.owed > 0) {
                    Text(stringResource(R.string.log_wage_owed, "${entry.owed.formatted()} ${entry.currency}"), style = DadaTheme.typography.caption, color = colors.sos)
                }
                if (entry.note.isNotBlank()) Text(entry.note, style = DadaTheme.typography.bodySmall, color = colors.muted)
            }
            IconButton(onClick = onLongPress) {
                Icon(DadaIcons.Close, contentDescription = stringResource(R.string.log_delete), tint = colors.muted)
            }
        }
    }
}

private fun Long.formatted(): String = NumberFormat.getIntegerInstance().format(this)

@PhonePreviews
@Composable
private fun LogPreview() = DadaTheme {
    val entries = listOf(
        LogEntry.Incident(3, LocalDate.of(2026, 10, 20), "Madam took my phone for two days.", listOf("a")),
        LogEntry.Hours(2, LocalDate.of(2026, 10, 18), "", 16.0, false),
        LogEntry.Wage(1, LocalDate.of(2026, 9, 30), "September salary", 1000, 0, "SAR"),
        LogEntry.Wage(4, LocalDate.of(2026, 8, 31), "August salary", 1000, 400, "SAR"),
    )
    LogScreen(LogUiState.Ready(entries, WagesSummary(mapOf("SAR" to 1600L), 2)), {}, {}, {}, {})
}
