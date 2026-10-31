package org.recitelabs.dadalink.core.domain.safety

/** Normalises agency names so "Abc Foreign Employment Agent PLC" matches "ABC foreign employment". */
object AgencyMatcher {
    private val noise = setOf(
        "plc", "p.l.c", "sc", "s.c", "llc", "ltd", "private", "pvt", "foreign", "employment", "agency",
        "agent", "agents", "overseas", "recruitment", "and", "&", "the",
    )

    fun normalize(name: String): String = name
        .lowercase()
        .replace(Regex("[^\\p{L}\\p{N} ]"), " ")
        .split(' ')
        .filter { it.isNotBlank() && it !in noise }
        .joinToString(" ")

    fun matches(query: String, candidateName: String, candidateLicence: String?): Boolean {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) return false
        if (candidateLicence != null && trimmed.equals(candidateLicence, ignoreCase = true)) return true
        val q = normalize(trimmed)
        if (q.length < 3) return false
        return normalize(candidateName) == q
    }
}
