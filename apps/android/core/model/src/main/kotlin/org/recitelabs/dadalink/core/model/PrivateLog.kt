package org.recitelabs.dadalink.core.model

import java.time.LocalDate

/** An entry in the private, device-only log. Amounts are whole currency units. */
sealed interface LogEntry {
    val id: Long
    val date: LocalDate
    val note: String

    data class Wage(
        override val id: Long = 0,
        override val date: LocalDate,
        override val note: String = "",
        val expected: Long,
        val received: Long,
        val currency: String,
    ) : LogEntry {
        val owed: Long get() = (expected - received).coerceAtLeast(0)
    }

    data class Hours(
        override val id: Long = 0,
        override val date: LocalDate,
        override val note: String = "",
        val hoursWorked: Double,
        val hadRestDay: Boolean,
    ) : LogEntry

    data class Incident(
        override val id: Long = 0,
        override val date: LocalDate,
        override val note: String,
        /** Opaque references to encrypted photos in app-private storage. */
        val photoIds: List<String> = emptyList(),
    ) : LogEntry
}

/** Totals derived from wage entries, grouped by currency. */
data class WagesSummary(
    val owedByCurrency: Map<String, Long>,
    val monthsWithWageEntries: Int,
) {
    val hasDebt: Boolean get() = owedByCurrency.values.any { it > 0 }

    companion object {
        val Empty = WagesSummary(emptyMap(), 0)
    }
}
