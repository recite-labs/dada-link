package org.recitelabs.dadalink.feature.log.add

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.recitelabs.dadalink.core.designsystem.component.DadaButton
import org.recitelabs.dadalink.core.designsystem.component.DadaChip
import org.recitelabs.dadalink.core.designsystem.component.DadaOutlinedButton
import org.recitelabs.dadalink.core.designsystem.component.DadaSwitchRow
import org.recitelabs.dadalink.core.designsystem.component.DadaTextButton
import org.recitelabs.dadalink.core.designsystem.component.DadaTextField
import org.recitelabs.dadalink.core.designsystem.icon.DadaIcons
import org.recitelabs.dadalink.core.designsystem.theme.DadaTheme
import org.recitelabs.dadalink.core.ui.DadaScreen
import org.recitelabs.dadalink.core.ui.PhonePreviews
import org.recitelabs.dadalink.feature.log.R
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import org.recitelabs.dadalink.core.ui.R as CoreUiR

private const val MAX_PHOTO_BYTES = 15 * 1024 * 1024

@Composable
internal fun AddLogEntryDestination(onDone: () -> Unit, viewModel: AddLogEntryViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    LaunchedEffect(state.isSaved) { if (state.isSaved) onDone() }
    // System photo picker: no storage permission needed, and the app only sees the chosen photo.
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri: Uri? ->
        if (uri != null) scope.launch {
            val bytes = withContext(Dispatchers.IO) {
                context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
            }
            if (bytes != null && bytes.size <= MAX_PHOTO_BYTES) viewModel.onAction(AddLogEntryAction.PhotoPicked(bytes))
        }
    }
    AddLogEntryScreen(
        state = state,
        onAction = viewModel::onAction,
        onBack = onDone,
        onAddPhoto = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddLogEntryScreen(
    state: AddLogEntryUiState,
    onAction: (AddLogEntryAction) -> Unit,
    onBack: () -> Unit,
    onAddPhoto: () -> Unit,
    modifier: Modifier = Modifier,
    today: LocalDate = LocalDate.now(),
) {
    var pickingDate by remember { mutableStateOf(false) }
    DadaScreen(title = stringResource(R.string.log_add_title), onBack = onBack, modifier = modifier, secure = true) {
        Column(
            modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = DadaTheme.spacing.screen),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                EntryKind.entries.forEach { kind ->
                    DadaChip(text = stringResource(kind.labelRes()), selected = state.kind == kind, onClick = { onAction(AddLogEntryAction.KindChanged(kind)) })
                }
            }
            Text(stringResource(R.string.log_date), style = DadaTheme.typography.titleSmall, color = DadaTheme.colors.ink)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                DadaChip(stringResource(R.string.log_today), selected = state.date == today, onClick = { onAction(AddLogEntryAction.DateChanged(today)) })
                DadaChip(stringResource(R.string.log_yesterday), selected = state.date == today.minusDays(1), onClick = { onAction(AddLogEntryAction.DateChanged(today.minusDays(1))) })
                DadaChip(
                    text = if (state.date.isBefore(today.minusDays(1))) state.date.toString() else stringResource(R.string.log_pick_date),
                    selected = state.date.isBefore(today.minusDays(1)),
                    onClick = { pickingDate = true },
                )
            }
            when (state.kind) {
                EntryKind.WAGE -> {
                    NumberField(state.expected, R.string.log_expected, EntryField.EXPECTED in state.invalid) { onAction(AddLogEntryAction.ExpectedChanged(it)) }
                    NumberField(state.received, R.string.log_received, EntryField.RECEIVED in state.invalid) { onAction(AddLogEntryAction.ReceivedChanged(it)) }
                    DadaTextField(
                        value = state.currency,
                        onValueChange = { onAction(AddLogEntryAction.CurrencyChanged(it)) },
                        label = stringResource(R.string.log_currency),
                        isError = EntryField.CURRENCY in state.invalid,
                    )
                }
                EntryKind.HOURS -> {
                    NumberField(state.hours, R.string.log_hours, EntryField.HOURS in state.invalid, KeyboardType.Decimal) { onAction(AddLogEntryAction.HoursChanged(it)) }
                    DadaSwitchRow(stringResource(R.string.log_rest_day), state.hadRestDay, { onAction(AddLogEntryAction.RestDayChanged(it)) })
                }
                EntryKind.INCIDENT -> {
                    DadaTextField(
                        value = state.description,
                        onValueChange = { onAction(AddLogEntryAction.DescriptionChanged(it)) },
                        label = stringResource(R.string.log_what_happened),
                        singleLine = false,
                        minLines = 4,
                        isError = EntryField.DESCRIPTION in state.invalid,
                    )
                    DadaOutlinedButton(
                        text = if (state.photoIds.isEmpty()) stringResource(R.string.log_add_photo) else pluralStringResource(R.plurals.log_photo_added, state.photoIds.size, state.photoIds.size),
                        onClick = onAddPhoto,
                        leadingIcon = DadaIcons.Photo,
                    )
                }
            }
            DadaTextField(value = state.note, onValueChange = { onAction(AddLogEntryAction.NoteChanged(it)) }, label = stringResource(R.string.log_note), singleLine = false, minLines = 2)
            if (state.invalid.isNotEmpty()) Text(stringResource(R.string.log_invalid), style = DadaTheme.typography.caption, color = DadaTheme.colors.sos)
        }
        DadaButton(
            text = stringResource(R.string.log_save),
            onClick = { onAction(AddLogEntryAction.Save) },
            enabled = !state.isSaving,
            modifier = Modifier.fillMaxWidth().navigationBarsPadding().imePadding().padding(DadaTheme.spacing.screen),
        )
    }
    if (pickingDate) DateDialog(state.date, onDismiss = { pickingDate = false }, onPick = { pickingDate = false; onAction(AddLogEntryAction.DateChanged(it)) })
}

@Composable
private fun NumberField(value: String, label: Int, isError: Boolean, type: KeyboardType = KeyboardType.Number, onChange: (String) -> Unit) {
    DadaTextField(value = value, onValueChange = onChange, label = stringResource(label), isError = isError, keyboardOptions = KeyboardOptions(keyboardType = type))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DateDialog(initial: LocalDate, onDismiss: () -> Unit, onPick: (LocalDate) -> Unit) {
    val pickerState = rememberDatePickerState(initialSelectedDateMillis = initial.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli())
    DatePickerDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            DadaTextButton(stringResource(CoreUiR.string.core_ui_save), onClick = {
                pickerState.selectedDateMillis?.let { onPick(Instant.ofEpochMilli(it).atZone(ZoneOffset.UTC).toLocalDate()) } ?: onDismiss()
            })
        },
        dismissButton = { DadaTextButton(stringResource(CoreUiR.string.core_ui_cancel), onClick = onDismiss) },
    ) { DatePicker(state = pickerState) }
}

private fun EntryKind.labelRes() = when (this) {
    EntryKind.WAGE -> R.string.log_kind_wage
    EntryKind.HOURS -> R.string.log_kind_hours
    EntryKind.INCIDENT -> R.string.log_kind_incident
}

@PhonePreviews
@Composable
private fun AddEntryPreview() = DadaTheme {
    AddLogEntryScreen(AddLogEntryUiState(date = LocalDate.of(2026, 10, 31), expected = "1000", received = "0"), {}, {}, {}, today = LocalDate.of(2026, 10, 31))
}
