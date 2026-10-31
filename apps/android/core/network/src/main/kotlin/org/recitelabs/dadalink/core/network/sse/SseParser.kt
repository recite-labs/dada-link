package org.recitelabs.dadalink.core.network.sse

/** One server-sent event. */
data class SseEvent(val event: String, val data: String)

/**
 * Incremental parser for the `text/event-stream` format (subset: `event:` and `data:` fields,
 * blank line dispatch, comments; `id:`/`retry:` are ignored). Feed it lines; it returns completed events.
 */
class SseParser {
    private var event: String? = null
    private val data = StringBuilder()

    fun feed(raw: String): SseEvent? {
        val line = raw.removeSuffix("\r")
        when {
            line.isEmpty() -> return dispatch()
            line.startsWith(":") -> Unit
            line.startsWith("event:") -> event = line.removePrefix("event:").trim()
            line.startsWith("data:") -> {
                if (data.isNotEmpty()) data.append('\n')
                data.append(line.removePrefix("data:").removePrefix(" "))
            }
        }
        return null
    }

    /** Flushes a trailing event that was not followed by a blank line. */
    fun finish(): SseEvent? = dispatch()

    private fun dispatch(): SseEvent? {
        if (data.isEmpty() && event == null) return null
        val result = SseEvent(event ?: "message", data.toString())
        event = null
        data.clear()
        return result
    }
}
