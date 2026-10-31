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

    @Test fun `flushes trailing event`() {
        val parser = SseParser()
        parser.feed("event: done")
        assertEquals(SseEvent("done", ""), parser.finish())
    }
}
