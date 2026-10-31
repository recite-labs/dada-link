package org.recitelabs.dadalink.core.ui

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

/**
 * The small Markdown subset used by reviewed content and assistant answers: `#` headings and
 * `**bold**` become bold, `-`/`*` list items become bullets. Everything else is shown as written,
 * so an unclosed `**` mid-stream simply appears until its pair arrives.
 */
fun simpleMarkdown(text: String): AnnotatedString = buildAnnotatedString {
    text.lines().forEachIndexed { index, raw ->
        if (index > 0) append('\n')
        val heading = HEADING.find(raw)
        val bullet = BULLET.find(raw)
        when {
            heading != null -> withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { appendInline(raw.substring(heading.range.last + 1)) }
            bullet != null -> {
                append(bullet.groupValues[1])
                append("•  ")
                appendInline(raw.substring(bullet.range.last + 1))
            }
            else -> appendInline(raw)
        }
    }
}

private fun AnnotatedString.Builder.appendInline(line: String) {
    var rest = line
    while (true) {
        val start = rest.indexOf("**")
        val end = if (start >= 0) rest.indexOf("**", start + 2) else -1
        if (start < 0 || end < 0) {
            append(rest)
            return
        }
        append(rest.substring(0, start))
        withStyle(SpanStyle(fontWeight = FontWeight.Bold)) { append(rest.substring(start + 2, end)) }
        rest = rest.substring(end + 2)
    }
}

private val HEADING = Regex("^#{1,6}\\s+")
private val BULLET = Regex("^(\\s*)[-*]\\s+")
