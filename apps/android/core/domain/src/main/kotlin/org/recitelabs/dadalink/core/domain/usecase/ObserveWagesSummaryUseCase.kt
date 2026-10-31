package org.recitelabs.dadalink.core.domain.usecase

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.recitelabs.dadalink.core.domain.repository.PrivateLogRepository
import org.recitelabs.dadalink.core.model.LogEntry
import org.recitelabs.dadalink.core.model.WagesSummary
import java.time.YearMonth
import javax.inject.Inject

class ObserveWagesSummaryUseCase @Inject constructor(private val log: PrivateLogRepository) {
    operator fun invoke(): Flow<WagesSummary> = log.entries.map(::summarize)

    companion object {
        fun summarize(entries: List<LogEntry>): WagesSummary {
            val wages = entries.filterIsInstance<LogEntry.Wage>()
            if (wages.isEmpty()) return WagesSummary.Empty
            val owed = wages.groupBy { it.currency.uppercase() }.mapValues { (_, list) -> list.sumOf { it.owed } }
            val months = wages.map { YearMonth.from(it.date) }.toSet().size
            return WagesSummary(owed, months)
        }
    }
}
