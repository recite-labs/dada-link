package org.recitelabs.dadalink.feature.log

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.core.testing.MainDispatcherRule
import org.recitelabs.dadalink.core.testing.fake.FakePrivateLogRepository
import org.recitelabs.dadalink.feature.log.add.AddLogEntryAction
import org.recitelabs.dadalink.feature.log.add.AddLogEntryViewModel
import org.recitelabs.dadalink.feature.log.add.EntryField
import org.recitelabs.dadalink.feature.log.add.EntryKind
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

class AddLogEntryViewModelTest {
    @get:Rule val main = MainDispatcherRule()

    private val repo = FakePrivateLogRepository()
    private val vm = AddLogEntryViewModel(repo, Clock.fixed(Instant.parse("2026-10-31T09:00:00Z"), ZoneOffset.UTC))

    @Test fun `saves a wage entry dated today`() = runTest {
        vm.onAction(AddLogEntryAction.ExpectedChanged("1,000"))
        vm.onAction(AddLogEntryAction.Save)

        assertTrue(vm.uiState.value.isSaved)
        assertEquals(
            LogEntry.Wage(id = 1, date = LocalDate.of(2026, 10, 31), expected = 1000, received = 0, currency = "SAR"),
            repo.entries.first().single(),
        )
    }

    @Test fun `rejects impossible hours`() = runTest {
        vm.onAction(AddLogEntryAction.KindChanged(EntryKind.HOURS))
        vm.onAction(AddLogEntryAction.HoursChanged("30"))
        vm.onAction(AddLogEntryAction.Save)

        assertEquals(setOf(EntryField.HOURS), vm.uiState.value.invalid)
        assertTrue(repo.entries.first().isEmpty())
    }

    @Test fun `incident keeps encrypted photo references`() = runTest {
        vm.onAction(AddLogEntryAction.KindChanged(EntryKind.INCIDENT))
        vm.onAction(AddLogEntryAction.DescriptionChanged("Passport taken"))
        vm.onAction(AddLogEntryAction.PhotoPicked(byteArrayOf(1, 2, 3)))
        vm.onAction(AddLogEntryAction.Save)

        val saved = repo.entries.first().single() as LogEntry.Incident
        assertEquals("Passport taken", saved.note)
        assertEquals(1, saved.photoIds.size)
        assertEquals(listOf<Byte>(1, 2, 3), repo.loadPhoto(saved.photoIds.single())!!.toList())
    }
}
