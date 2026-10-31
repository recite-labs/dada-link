package org.recitelabs.dadalink.core.network

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.recitelabs.dadalink.core.network.sse.SseEvent
import org.recitelabs.dadalink.core.network.sse.SseParser

class SseParserTest {
    @Test fun `parses events, multi-line data and ignores comments`() {
        val parser = SseParser()
        val lines = listOf(": keep-alive", "event: delta", "data: {\"text\":\"Hi\"}", "", "data: a", "data: b", "")
        val events = lines.mapNotNull(parser::feed)
        assertEquals(listOf(SseEvent("delta", "{\"text\":\"Hi\"}"), SseEvent("message", "a\nb")), events)
        assertNull(parser.finish())
    }

    @Test fun `effect style bare data lines without space or event name`() {
        val parser = SseParser()
        val events = listOf("data:{\"_tag\":\"Done\"}", "", "id: 7", "data: x", "").mapNotNull(parser::feed)
        assertEquals(listOf(SseEvent("message", "{\"_tag\":\"Done\"}"), SseEvent("message", "x")), events)
    }

    @Test fun `tolerates CRLF line endings`() {
        val parser = SseParser()
        val events = listOf("event: delta\r", "data: a\r", "\r").mapNotNull(parser::feed)
        assertEquals(listOf(SseEvent("delta", "a")), events)
    }

    @Test fun `flushes trailing event`() {
        val parser = SseParser()
        parser.feed("event: done")
        assertEquals(SseEvent("done", ""), parser.finish())
    }
}
