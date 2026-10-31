package org.recitelabs.dadalink.feature.log.add

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.recitelabs.dadalink.core.domain.repository.PrivateLogRepository
import org.recitelabs.dadalink.core.model.LogEntry
import java.time.Clock
import java.time.LocalDate
import javax.inject.Inject

enum class EntryKind { WAGE, HOURS, INCIDENT }

enum class EntryField { EXPECTED, RECEIVED, CURRENCY, HOURS, DESCRIPTION }

data class AddLogEntryUiState(
    val kind: EntryKind = EntryKind.WAGE,
    val date: LocalDate,
    val expected: String = "",
    val received: String = "",
    val currency: String = "SAR",
    val hours: String = "",
    val hadRestDay: Boolean = false,
    val description: String = "",
    val note: String = "",
    val photoIds: List<String> = emptyList(),
    val invalid: Set<EntryField> = emptySet(),
    val isSaving: Boolean = false,
    val isSaved: Boolean = false,
)

sealed interface AddLogEntryAction {
    data class KindChanged(val kind: EntryKind) : AddLogEntryAction
    data class DateChanged(val date: LocalDate) : AddLogEntryAction
    data class ExpectedChanged(val value: String) : AddLogEntryAction
    data class ReceivedChanged(val value: String) : AddLogEntryAction
    data class CurrencyChanged(val value: String) : AddLogEntryAction
    data class HoursChanged(val value: String) : AddLogEntryAction
    data class RestDayChanged(val value: Boolean) : AddLogEntryAction
    data class DescriptionChanged(val value: String) : AddLogEntryAction
    data class NoteChanged(val value: String) : AddLogEntryAction
    data class PhotoPicked(val bytes: ByteArray) : AddLogEntryAction
    data object Save : AddLogEntryAction
}

@HiltViewModel
class AddLogEntryViewModel @Inject constructor(
    private val log: PrivateLogRepository,
    clock: Clock,
) : ViewModel() {

    private val state = MutableStateFlow(AddLogEntryUiState(date = LocalDate.now(clock)))
    val uiState: StateFlow<AddLogEntryUiState> = state.asStateFlow()

    fun onAction(action: AddLogEntryAction) {
        when (action) {
            is AddLogEntryAction.KindChanged -> state.update { it.copy(kind = action.kind, invalid = emptySet()) }
            is AddLogEntryAction.DateChanged -> state.update { it.copy(date = action.date) }
            is AddLogEntryAction.ExpectedChanged -> state.update { it.copy(expected = action.value.digitsOnly(), invalid = it.invalid - EntryField.EXPECTED) }
            is AddLogEntryAction.ReceivedChanged -> state.update { it.copy(received = action.value.digitsOnly(), invalid = it.invalid - EntryField.RECEIVED) }
            is AddLogEntryAction.CurrencyChanged -> state.update { it.copy(currency = action.value.uppercase().filter(Char::isLetter).take(3)) }
            is AddLogEntryAction.HoursChanged -> state.update { it.copy(hours = action.value.filter { c -> c.isDigit() || c == '.' }.take(4), invalid = it.invalid - EntryField.HOURS) }
            is AddLogEntryAction.RestDayChanged -> state.update { it.copy(hadRestDay = action.value) }
            is AddLogEntryAction.DescriptionChanged -> state.update { it.copy(description = action.value, invalid = it.invalid - EntryField.DESCRIPTION) }
            is AddLogEntryAction.NoteChanged -> state.update { it.copy(note = action.value) }
            is AddLogEntryAction.PhotoPicked -> viewModelScope.launch {
                val id = log.storePhoto(action.bytes)
                state.update { it.copy(photoIds = it.photoIds + id) }
            }
            AddLogEntryAction.Save -> save()
        }
    }

    private fun save() {
        val s = state.value
        if (s.isSaving) return
        val (entry, invalid) = build(s)
        if (entry == null) {
            state.update { it.copy(invalid = invalid) }
            return
        }
        state.update { it.copy(isSaving = true) }
        viewModelScope.launch {
            log.add(entry)
            state.update { it.copy(isSaving = false, isSaved = true) }
        }
    }

    private fun build(s: AddLogEntryUiState): Pair<LogEntry?, Set<EntryField>> {
        val note = s.note.trim()
        return when (s.kind) {
            EntryKind.WAGE -> {
                val expected = s.expected.toLongOrNull()
                val received = s.received.ifBlank { "0" }.toLongOrNull()
                val invalid = buildSet {
                    if (expected == null || expected <= 0) add(EntryField.EXPECTED)
                    if (received == null) add(EntryField.RECEIVED)
                    if (s.currency.length != 3) add(EntryField.CURRENCY)
                }
                if (invalid.isNotEmpty()) null to invalid
                else LogEntry.Wage(date = s.date, note = note, expected = expected!!, received = received!!, currency = s.currency) to emptySet()
            }
            EntryKind.HOURS -> {
                val hours = s.hours.toDoubleOrNull()
                if (hours == null || hours <= 0 || hours > 24) null to setOf(EntryField.HOURS)
                else LogEntry.Hours(date = s.date, note = note, hoursWorked = hours, hadRestDay = s.hadRestDay) to emptySet()
            }
            EntryKind.INCIDENT -> {
                if (s.description.isBlank()) null to setOf(EntryField.DESCRIPTION)
                else {
                    val text = listOf(s.description.trim(), note).filter(String::isNotBlank).joinToString("\n")
                    LogEntry.Incident(date = s.date, note = text, photoIds = s.photoIds) to emptySet()
                }
            }
        }
    }

    private fun String.digitsOnly() = filter(Char::isDigit).take(9)
}
