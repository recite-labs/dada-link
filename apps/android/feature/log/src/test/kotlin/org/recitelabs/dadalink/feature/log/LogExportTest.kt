package org.recitelabs.dadalink.feature.log

import org.junit.Assert.assertEquals
import org.junit.Test
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.feature.log.list.LogExport
import org.recitelabs.dadalink.feature.log.list.LogExportLabels
import java.time.LocalDate

class LogExportTest {
    private val labels = LogExportLabels("DadaLink log", "Wage", "Hours", "Incident", "expected", "received", "owed", "no rest day")

    @Test fun `exports chronologically as plain text`() {
        val text = LogExport.format(
            listOf(
                LogEntry.Incident(2, LocalDate.of(2026, 10, 3), "Passport taken"),
                LogEntry.Wage(1, LocalDate.of(2026, 9, 30), "", 1000, 400, "SAR"),
                LogEntry.Hours(3, LocalDate.of(2026, 10, 4), "", 16.0, false),
            ),
            labels,
        )
        assertEquals(
            """
            DadaLink log

            2026-09-30 — Wage: expected 1000 SAR, received 400 SAR, owed 600 SAR
            2026-10-03 — Incident
              Passport taken
            2026-10-04 — Hours: 16 · no rest day
            """.trimIndent(),
            text,
        )
    }
}
