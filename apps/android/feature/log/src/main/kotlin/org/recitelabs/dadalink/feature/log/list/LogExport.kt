package org.recitelabs.dadalink.feature.log.list

import org.recitelabs.dadalink.core.model.LogEntry
import java.time.format.DateTimeFormatter

/** Localised labels for the plain-text export. */
data class LogExportLabels(
    val header: String,
    val wage: String,
    val hours: String,
    val incident: String,
    val expected: String,
    val received: String,
    val owed: String,
    val noRestDay: String,
)

/** Plain-text export: readable by a lawyer, embassy or NGO without any app. Photos stay on the phone. */
object LogExport {
    private val date = DateTimeFormatter.ISO_LOCAL_DATE

    fun format(entries: List<LogEntry>, labels: LogExportLabels): String = buildString {
        appendLine(labels.header)
        entries.sortedBy { it.date }.forEach { entry ->
            append("\n").append(date.format(entry.date)).append(" — ")
            when (entry) {
                is LogEntry.Wage -> append(labels.wage).append(": ")
                    .append(labels.expected).append(' ').append(entry.expected).append(' ').append(entry.currency).append(", ")
                    .append(labels.received).append(' ').append(entry.received).append(' ').append(entry.currency).append(", ")
                    .append(labels.owed).append(' ').append(entry.owed).append(' ').append(entry.currency)
                is LogEntry.Hours -> {
                    append(labels.hours).append(": ").append(entry.hoursWorked.toString().removeSuffix(".0"))
                    if (!entry.hadRestDay) append(" · ").append(labels.noRestDay)
                }
                is LogEntry.Incident -> append(labels.incident)
            }
            if (entry.note.isNotBlank()) append("\n  ").append(entry.note.trim())
        }
    }.trimEnd()
}
