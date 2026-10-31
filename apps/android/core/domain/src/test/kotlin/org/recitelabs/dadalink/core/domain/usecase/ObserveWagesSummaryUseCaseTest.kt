package org.recitelabs.dadalink.core.domain.usecase

import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.core.model.WagesSummary
import org.recitelabs.dadalink.core.testing.fake.FakePrivateLogRepository
import java.time.LocalDate

class ObserveWagesSummaryUseCaseTest {
    @Test fun `sums what is owed per currency and counts months`() {
        val summary = ObserveWagesSummaryUseCase.summarize(
            listOf(
                LogEntry.Wage(date = LocalDate.of(2026, 8, 30), expected = 1000, received = 0, currency = "SAR"),
                LogEntry.Wage(date = LocalDate.of(2026, 9, 30), expected = 1000, received = 400, currency = "sar"),
                LogEntry.Wage(date = LocalDate.of(2026, 9, 15), expected = 100, received = 150, currency = "USD"),
                LogEntry.Hours(date = LocalDate.of(2026, 9, 1), hoursWorked = 16.0, hadRestDay = false),
            ),
        )
        assertEquals(mapOf("SAR" to 1600L, "USD" to 0L), summary.owedByCurrency)
        assertEquals(2, summary.monthsWithWageEntries)
    }

    @Test fun `emits updates as entries are added`() = runTest {
        val repo = FakePrivateLogRepository()
        ObserveWagesSummaryUseCase(repo)().test {
            assertEquals(WagesSummary.Empty, awaitItem())
            repo.add(LogEntry.Wage(date = LocalDate.of(2026, 9, 30), expected = 1000, received = 0, currency = "SAR"))
            assertEquals(mapOf("SAR" to 1000L), awaitItem().owedByCurrency)
        }
        assertFalse(WagesSummary.Empty.hasDebt)
    }
}
